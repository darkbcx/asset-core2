# Database Setup - Summary

This document summarizes the database setup structure for AssetCore.

## Directory Structure

All database-related files are now organized in the `database/` folder:

```
database/
├── migrations/              # SQL schema migrations
│   └── 001_initial_schema.sql
├── seeds/                   # Sample data for development
│   └── 001_initial_data.sql
├── scripts/                 # TypeScript utility scripts
│   ├── init-db.ts          # Interactive database initialization
│   ├── db-utils.ts         # Database operations (migrate, seed, reset, etc.)
│   └── README.md
├── index.md                # Navigation hub
├── README.md               # Main documentation
├── QUICK_START.md          # Quick setup guide
├── SCRIPTS.md              # Scripts reference
└── setup.sh                # Bash alternative (optional)

src/
└── lib/
    └── db.ts               # Database connection utilities
```

## Quick Start

```bash
# Initialize database (interactive)
npm run db:init

# Run migrations only
DB_PASSWORD=pass npm run db:migrate

# Seed data only
DB_PASSWORD=pass npm run db:seed

# Reset everything
DB_PASSWORD=pass npm run db:reset

# View status
DB_PASSWORD=pass npm run db:status
```

## Key Features

✅ TypeScript-based scripts for cross-platform compatibility
✅ Interactive database initialization
✅ Automated migrations and seeding
✅ Database status monitoring
✅ Backup and restore capabilities
✅ Complete documentation

See `database/` folder for full documentation.
