# StockBox Backend API

Backend REST API for StockBox - Inventory Management System

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: Microsoft SQL Server
- **Validation**: Zod

## Project Structure

```
backend/
├── migrations/              # SQL migration files
├── src/
│   ├── api/                # API controllers
│   │   └── v1/            # API version 1
│   │       ├── external/  # Public endpoints
│   │       └── internal/  # Authenticated endpoints
│   ├── config/            # Configuration management
│   ├── middleware/        # Express middleware
│   ├── migrations/        # Migration runner code
│   ├── routes/            # Route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── server.ts          # Application entry point
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- SQL Server instance available
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run migrations:
```bash
npm run build
node dist/migrations/run-migrations.js
```

### Development

Start development server with hot reload:
```bash
npm run dev
```

### Production Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Documentation

### Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.yourdomain.com/api/v1`

### Health Check

```
GET /health
```

Returns server health status.

## Environment Variables

Required environment variables:

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `DB_SERVER`: Database server address
- `DB_PORT`: Database port (default: 1433)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_ENCRYPT`: Enable encryption (true/false)

## Database Migrations

Migrations run automatically on server startup. To run manually:

```bash
ts-node src/migrations/run-migrations.ts
```

To skip migrations on startup:
```bash
SKIP_MIGRATIONS=true npm start
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Code Quality

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## License

ISC