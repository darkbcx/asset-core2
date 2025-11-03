# Database Scripts

Scripts for managing database migrations and seed data.

## Scripts

### migrate.ts

Runs all pending SQL migrations in order, tracking executed migrations in the `migrations` table.

**Usage:**
```bash
yarn migrate
```

**Features:**
- Automatically tracks executed migrations
- Skips already executed migrations
- Executes migrations in numerical order
- Rolls back on error

### seed.ts

Generates sample data for development and testing.

**Usage:**
```bash
yarn seed
```

**Includes:**
- Test users with different roles
- Sample companies
- Assets and components
- Maintenance records

**⚠️ DO NOT run in production!**

The script generates all data programmatically using INSERT statements.

### reset.ts

Drops all tables in the database and optionally re-runs migrations and seeds.

**Usage:**
```bash
yarn reset        # Drop all tables
yarn reset:full   # Drop all tables, re-run migrations and seeds
```

**⚠️ WARNING: This will delete all data!**

**Features:**
- Drops all tables in the database
- Temporarily disables foreign key checks
- Optionally re-runs migrations and seeds for a full reset
- Automatically creates database if it doesn't exist

## Environment Variables

All scripts use the following environment variables from `.env.local`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=assetcore_dev
```

## Migration Files

Migration files should follow the naming pattern: `NNN_name.sql`

Example:
- `001_initial_schema.sql`
- `002_add_new_table.sql`

The number prefix determines execution order.

## Seed Implementation

Seeding is handled programmatically by the TypeScript `seed.ts` script, which generates all sample data using INSERT statements. There are no separate SQL seed files.

## Error Handling

- Migrations rollback on error
- Seed operations rollback on error
- Both scripts log detailed progress
