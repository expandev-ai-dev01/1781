/**
 * @summary
 * Database Migration Runner
 * Automatically runs database migrations on application startup
 *
 * @module migrations/migration-runner
 */

import sql from 'mssql';
import * as fs from 'fs/promises';
import * as path from 'path';

interface MigrationConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
  encrypt: boolean;
}

interface MigrationRecord {
  id: number;
  filename: string;
  executed_at: Date;
  checksum: string;
}

export class MigrationRunner {
  private config: sql.config;
  private migrationsPath: string;

  constructor(config: MigrationConfig, migrationsPath: string = './migrations') {
    this.config = {
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      options: {
        encrypt: config.encrypt,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    };
    this.migrationsPath = path.resolve(migrationsPath);
  }

  private async initializeMigrationTable(pool: sql.ConnectionPool): Promise<void> {
    const createTableSQL = `
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'migrations' AND schema_id = SCHEMA_ID('dbo'))
      BEGIN
        CREATE TABLE [dbo].[migrations] (
          [id] INT IDENTITY(1,1) PRIMARY KEY,
          [filename] NVARCHAR(255) NOT NULL UNIQUE,
          [executed_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
          [checksum] NVARCHAR(64) NOT NULL
        );
        PRINT 'Migration tracking table created successfully';
      END
    `;

    await pool.request().query(createTableSQL);
    console.log('✓ Migration tracking table initialized');
  }

  private async getExecutedMigrations(pool: sql.ConnectionPool): Promise<Set<string>> {
    try {
      const result = await pool
        .request()
        .query<MigrationRecord>('SELECT filename FROM [dbo].[migrations] ORDER BY id');
      return new Set(result.recordset.map((r) => r.filename));
    } catch (error) {
      console.log('No previous migrations found');
      return new Set();
    }
  }

  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async recordMigration(
    pool: sql.ConnectionPool,
    filename: string,
    checksum: string
  ): Promise<void> {
    await pool
      .request()
      .input('filename', sql.NVarChar(255), filename)
      .input('checksum', sql.NVarChar(64), checksum).query(`
        INSERT INTO [dbo].[migrations] (filename, checksum)
        VALUES (@filename, @checksum)
      `);
  }

  private async executeMigration(
    pool: sql.ConnectionPool,
    filename: string,
    content: string
  ): Promise<void> {
    console.log(`\n→ Executing migration: ${filename}`);

    const batches = content
      .split(/^\s*GO\s*$/im)
      .map((batch) => batch.trim())
      .filter((batch) => batch.length > 0);

    console.log(`  Found ${batches.length} SQL batches to execute`);

    for (let i = 0; i < batches.length; i++) {
      try {
        await pool.request().query(batches[i]);
        console.log(`  ✓ Batch ${i + 1}/${batches.length} executed`);
      } catch (error: any) {
        console.error(`  ✗ Batch ${i + 1}/${batches.length} failed:`);
        console.error(`    ${error.message}`);
        throw new Error(`Migration ${filename} failed at batch ${i + 1}: ${error.message}`);
      }
    }

    const checksum = this.calculateChecksum(content);
    await this.recordMigration(pool, filename, checksum);
    console.log(`✓ Migration ${filename} completed successfully`);
  }

  private async getMigrationFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files.filter((f) => f.endsWith('.sql')).sort();
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️  Migrations directory not found: ${this.migrationsPath}`);
        console.warn(`   This is normal if no database migrations were generated.`);
      } else {
        console.error(`Error reading migrations directory: ${error.message}`);
      }
      return [];
    }
  }

  async runMigrations(): Promise<void> {
    console.log('\n' + '='.repeat(40));
    console.log('DATABASE MIGRATION RUNNER');
    console.log('='.repeat(40) + '\n');

    let pool: sql.ConnectionPool | null = null;

    try {
      console.log('→ Connecting to database...');
      pool = await sql.connect(this.config);
      console.log('✓ Database connection established\n');

      await this.initializeMigrationTable(pool);

      const executedMigrations = await this.getExecutedMigrations(pool);
      console.log(`→ Found ${executedMigrations.size} previously executed migrations\n`);

      const migrationFiles = await this.getMigrationFiles();
      console.log(`→ Found ${migrationFiles.length} migration files\n`);

      if (migrationFiles.length === 0) {
        console.log('✓ No migrations to run\n');
        return;
      }

      const pendingMigrations = migrationFiles.filter((f) => !executedMigrations.has(f));

      if (pendingMigrations.length === 0) {
        console.log('✓ Database is up to date - no pending migrations\n');
        return;
      }

      console.log(`→ Running ${pendingMigrations.length} pending migrations...\n`);

      for (const filename of pendingMigrations) {
        const filePath = path.join(this.migrationsPath, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        await this.executeMigration(pool, filename, content);
      }

      console.log('\n' + '='.repeat(40));
      console.log('✓ ALL MIGRATIONS COMPLETED SUCCESSFULLY');
      console.log('='.repeat(40) + '\n');
    } catch (error: any) {
      console.error('\n' + '='.repeat(40));
      console.error('✗ MIGRATION FAILED');
      console.error('='.repeat(40));
      console.error(`Error: ${error.message}\n`);
      throw error;
    } finally {
      if (pool) {
        await pool.close();
        console.log('→ Database connection closed\n');
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const pool = await sql.connect(this.config);
      await pool.close();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export async function runDatabaseMigrations(options?: {
  skipIfNoNewMigrations?: boolean;
  logLevel?: 'silent' | 'minimal' | 'verbose';
}): Promise<void> {
  const skipIfNoNewMigrations = options?.skipIfNoNewMigrations ?? true;
  const logLevel = options?.logLevel ?? 'minimal';

  if (process.env.SKIP_MIGRATIONS === 'true') {
    if (logLevel !== 'silent') {
      console.log('ℹ️  Migrations skipped (SKIP_MIGRATIONS=true)');
    }
    return;
  }

  const requiredEnvVars = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    const error = `Missing required database environment variables: ${missingVars.join(', ')}`;
    console.error('❌ Migration Configuration Error:');
    console.error(`   ${error}`);
    console.error('\n   Please ensure the following environment variables are configured:');
    console.error('   - DB_SERVER (e.g., your-server.database.windows.net)');
    console.error('   - DB_NAME (e.g., your-database)');
    console.error('   - DB_USER (e.g., your-admin-user)');
    console.error('   - DB_PASSWORD (your database password)');
    console.error('   - DB_PORT (optional, defaults to 1433)');
    console.error('   - DB_ENCRYPT (optional, defaults to false)\n');
    throw new Error(error);
  }

  const config: MigrationConfig = {
    server: process.env.DB_SERVER!,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    encrypt: process.env.DB_ENCRYPT === 'true',
  };

  const migrationsPath = process.env.MIGRATIONS_PATH || path.join(__dirname, '../../migrations');

  const runner = new MigrationRunner(config, migrationsPath);

  const migrationFiles = await runner['getMigrationFiles']();

  if (migrationFiles.length === 0) {
    if (logLevel === 'verbose') {
      console.log('✓ No migration files found - skipping migration');
    }
    return;
  }

  await runner.runMigrations();
}
