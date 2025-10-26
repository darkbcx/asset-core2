# Database Scripts

This directory contains utility scripts for database management and automation.

## Available Scripts

### Database Initialization

**Script:** `init-db.ts`

Interactive script that guides you through the database setup process.

Initialize and set up the AssetCore database with migrations and optional seed data.

**Usage:**
```bash
# Using npm script (recommended)
npm run db:init

# Or directly with tsx
npx tsx database/scripts/init-db.ts
```

**Features:**
- ✅ Interactive password prompt
- ✅ Tests MySQL connection before proceeding
- ✅ Creates database if it doesn't exist
- ✅ Runs all migrations automatically
- ✅ Optional database seeding with sample data
- ✅ Displays database summary after seeding
- ✅ Colored console output for better visibility
- ✅ Graceful error handling

**Environment Variables:**
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (can be set or prompted)
- `DB_NAME` - Database name (default: assetcore_dev)

**Example:**
```bash
DB_HOST=localhost DB_USER=admin npm run db:init
```

## Script Details

### init-db.ts

A TypeScript script that automates the database initialization process.

**Process:**
1. Tests MySQL connection
2. Creates the database if it doesn't exist
3. Runs all migration files from `database/migrations/`
4. Prompts user to seed sample data (optional)
5. Displays summary of created records

**Dependencies:**
- `mysql2` - MySQL client for Node.js
- `tsx` - TypeScript execution environment

**Benefits over bash script:**
- ✅ Type-safe implementation
- ✅ Better error handling
- ✅ Cross-platform compatibility
- ✅ Integrated with TypeScript project
- ✅ Consistent with project tooling

### Database Utilities

**Script:** `db-utils.ts`

Utility script for common database operations. Requires `DB_PASSWORD` environment variable.

**Usage:**
```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database (drop, create, migrate, seed)
npm run db:reset

# Create backup
npm run db:backup

# Show database status
npm run db:status

# Show help
npm run db:help
```

**Commands:**
- `migrate` - Run database migrations
- `seed` - Seed database with sample data
- `reset` - Drop, create, migrate, and seed database
- `backup` - Create database backup
- `status` - Show database status and table information

**Environment Variables:**
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (required)
- `DB_NAME` - Database name (default: assetcore_dev)

**Example:**
```bash
DB_PASSWORD=yourpass npm run db:migrate
```
