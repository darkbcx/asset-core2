# AssetCore Database Management

This directory contains database migration and seed files for the AssetCore multi-tenant asset management system.

## Directory Structure

```
database/
├── migrations/          # Database schema migrations
│   └── 001_initial_schema.sql
├── seeds/              # Seed data files
│   └── 001_initial_data.sql
├── scripts/            # TypeScript utility scripts
│   ├── init-db.ts      # Interactive database initialization
│   ├── db-utils.ts     # Database operation utilities
│   └── README.md       # Scripts documentation
├── README.md           # This file
├── QUICK_START.md      # Quick start guide
└── SCRIPTS.md          # Scripts reference
```

## Prerequisites

- MySQL 8.0 or higher
- Database user with CREATE, INSERT, UPDATE, DELETE, and DROP permissions
- Database created (e.g., `assetcore_dev`)

## Database Setup

### Quick Setup (Recommended)

Use the TypeScript initialization script:

```bash
npm run db:init
```

This will:
- Test MySQL connection
- Create the database
- Run all migrations
- Optionally seed sample data

### Manual Setup

### 1. Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS assetcore_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Or for production
CREATE DATABASE IF NOT EXISTS assetcore_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
EXIT;
```

### 2. Run Migrations

Using TypeScript script:
```bash
DB_PASSWORD=yourpass npm run db:migrate
```

Or manually:
```bash
# From project root
mysql -u root -p assetcore_dev < database/migrations/001_initial_schema.sql
```

### 3. Seed Data (Optional)

For development/testing purposes, you can populate the database with sample data:

Using TypeScript script:
```bash
DB_PASSWORD=yourpass npm run db:seed
```

Or manually:
```bash
# Seed initial data
mysql -u root -p assetcore_dev < database/seeds/001_initial_data.sql
```

### Available Commands

```bash
# Interactive setup (recommended for first time)
npm run db:init

# Run migrations
DB_PASSWORD=yourpass npm run db:migrate

# Seed data
DB_PASSWORD=yourpass npm run db:seed

# Reset database (drop, create, migrate, seed)
DB_PASSWORD=yourpass npm run db:reset

# Create backup
DB_PASSWORD=yourpass npm run db:backup

# Show database status
DB_PASSWORD=yourpass npm run db:status

# Show help
npm run db:help
```

## Testing the Setup

### Verify Tables

```bash
mysql -u root -p assetcore_dev -e "SHOW TABLES;"
```

You should see the following tables:
- `companies`
- `users`
- `user_companies`
- `locations`
- `assets`
- `components`
- `maintenance_records`
- `component_transfers`
- `maintenance_attachments`
- `files`
- `file_versions`
- `file_access_logs`
- `audit_logs`

### Verify Seed Data

```bash
mysql -u root -p assetcore_dev -e "SELECT COUNT(*) as companies FROM companies; SELECT COUNT(*) as users FROM users;"
```

## Seed Data Details

### Test Companies

1. **Acme Aviation Corporation** (slug: `acme-aviation`)
   - Subscription: Professional
   - Active tenants with assets and components

2. **Global Logistics Ltd** (slug: `global-logistics`)
   - Subscription: Enterprise
   - Active tenants

### Test Users

#### System Administrators
- **Email:** admin@assetcore.com
- **Password:** Password123!
- **Role:** Super Administrator

#### Tenant Users (Acme Aviation)

1. **Company Administrator**
   - Email: john.doe@acme.com
   - Password: Password123!
   - Role: Company Administrator
   - Full permissions within Acme company

2. **Asset Manager**
   - Email: jane.smith@acme.com
   - Password: Password123!
   - Role: Asset Manager
   - Asset and maintenance management permissions

3. **Maintenance Technician**
   - Email: mike.johnson@acme.com
   - Password: Password123!
   - Role: Maintenance Technician
   - Maintenance and asset read permissions

#### Tenant Users (Global Logistics)

1. **Company Administrator**
   - Email: sarah.lee@globallogistics.com
   - Password: Password123!
   - Role: Company Administrator

### Sample Data Includes

- **2 Companies** with different subscription plans
- **5 Users** (1 system admin + 4 tenant users)
- **3 Locations** (hierarchical structure)
- **2 Assets** (1 Boeing 737-800 aircraft, 1 Ground Support Vehicle)
- **4 Components** (2 engines, 1 avionics, 1 vehicle engine)
- **2 Maintenance Records** (1 scheduled, 1 on-demand)
- **1 Component Transfer** (example transfer between assets)
- **1 Audit Log** entry

## Environment Variables

Make sure your `.env` file has the correct database configuration:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=assetcore_dev
```

## Troubleshooting

### UUID Functions Error

If you encounter errors with `UUID_TO_BIN` or `BIN_TO_UUID` functions:

```sql
-- Check if functions exist
SHOW FUNCTION STATUS WHERE Name IN ('UUID_TO_BIN', 'BIN_TO_UUID');

-- If not, the migration file will create them automatically
```

### Foreign Key Constraints

If you need to disable foreign key checks temporarily:

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Your SQL statements
SET FOREIGN_KEY_CHECKS = 1;
```

### Character Set Issues

Ensure your database uses UTF-8 encoding:

```sql
ALTER DATABASE assetcore_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Backup and Restore

### Backup Database

```bash
mysqldump -u root -p assetcore_dev > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
mysql -u root -p assetcore_dev < backup_20240101_120000.sql
```

## Reset Database

To completely reset the database (⚠️ **WARNING: This will delete all data**):

Using TypeScript script:
```bash
DB_PASSWORD=yourpass npm run db:reset
```

Or manually:
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS assetcore_dev; CREATE DATABASE assetcore_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations and seeds
mysql -u root -p assetcore_dev < database/migrations/001_initial_schema.sql
mysql -u root -p assetcore_dev < database/seeds/001_initial_data.sql
```

## Next Steps

After setting up the database:

1. Update your `.env` file with database credentials
2. Test database connection in your application
3. Verify data with the test users
4. Start developing with the seeded data

## Support

For issues or questions about the database setup, please refer to the main project documentation or contact the development team.
