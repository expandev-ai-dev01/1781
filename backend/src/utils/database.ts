/**
 * @summary
 * Database utility functions
 * Provides database connection and query execution helpers
 *
 * @module utils/database
 */

import sql from 'mssql';
import { config } from '@/config';

export enum ExpectedReturn {
  None = 'None',
  Single = 'Single',
  Multi = 'Multi',
}

export interface IRecordSet<T = any> {
  recordset: T[];
}

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config.database);
  }
  return pool;
}

export async function dbRequest(
  routine: string,
  parameters: any,
  expectedReturn: ExpectedReturn,
  transaction?: sql.Transaction,
  resultSetNames?: string[]
): Promise<any> {
  const currentPool = transaction || (await getPool());
  const request = currentPool.request();

  Object.keys(parameters).forEach((key) => {
    request.input(key, parameters[key]);
  });

  const result = await request.execute(routine);

  switch (expectedReturn) {
    case ExpectedReturn.None:
      return null;
    case ExpectedReturn.Single:
      return result.recordset[0];
    case ExpectedReturn.Multi:
      if (resultSetNames && resultSetNames.length > 0) {
        const namedResults: any = {};
        resultSetNames.forEach((name, index) => {
          namedResults[name] = result.recordsets[index];
        });
        return namedResults;
      }
      return result.recordsets;
    default:
      return result.recordset;
  }
}

export async function beginTransaction(): Promise<sql.Transaction> {
  const currentPool = await getPool();
  const transaction = new sql.Transaction(currentPool);
  await transaction.begin();
  return transaction;
}

export async function commitTransaction(transaction: sql.Transaction): Promise<void> {
  await transaction.commit();
}

export async function rollbackTransaction(transaction: sql.Transaction): Promise<void> {
  await transaction.rollback();
}
