# Database Setup

AssetCore database migrations and seed data.

## Directory Structure

```
database/
├── migrations/              # SQL schema migrations
│   └── 001_initial_schema.sql
└── scripts/                 # TypeScript utility scripts
    ├── migrate.ts          # Run migrations
    ├── seed.ts             # Seed sample data
    └── README.md
```

## Prerequisites

- MySQL 8.0 or higher
- Node.js with yarn
- Environment variables configured

## Environment Variables

Create a `.env.local` file in the project root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=assetcore_dev
```

## Quick Start

### 1. Run Migrations

```bash
yarn migrate
```

This will automatically create the database if it doesn't exist and run all pending migrations.

### 2. Seed Data (Optional)

```bash
yarn seed
```

This will automatically create the database if it doesn't exist and populate it with sample data using the TypeScript seed script.

## Available Commands

```bash
# Run migrations
yarn migrate

# Seed database with sample data
yarn seed

# Reset database (drop all tables)
yarn reset

# Full reset (drop all tables, re-run migrations and seeds)
yarn reset:full
```

## Test Credentials

After seeding, you can use these accounts:

### System Administrator
- **Email:** admin@assetcore.com
- **Password:** Password123!
- **Access:** Full system access

### Company Administrator (Acme Aviation)
- **Email:** john.doe@acme.com
- **Password:** Password123!
- **Access:** Full company access

### Asset Manager
- **Email:** jane.smith@acme.com
- **Password:** Password123!
- **Access:** Asset and maintenance management

### Maintenance Technician
- **Email:** mike.johnson@acme.com
- **Password:** Password123!
- **Access:** Maintenance operations

## Sample Data

The seed script creates:
- 2 Companies (Acme Aviation, Global Logistics)
- 5 Users (1 system admin + 4 tenant users)
- 3 Assets (Boeing 737-800, Ground Support Vehicle, Generator)
- 4 Components (engines, tires, batteries)
- 2 Maintenance Records
- 1 Component Transfer

## Verify Setup

```bash
# Check tables
mysql -u root -p assetcore_dev -e "SHOW TABLES;"

# Check record counts
mysql -u root -p assetcore_dev -e "SELECT 'Companies' as table_name, COUNT(*) as records FROM companies UNION ALL SELECT 'Users', COUNT(*) FROM users UNION ALL SELECT 'Assets', COUNT(*) FROM assets;"
```

## Migration System

The migration system tracks executed migrations in a `migrations` table:
- Each migration file must follow the pattern: `NNN_name.sql`
- Migrations are executed in numerical order
- Already executed migrations are automatically skipped

## Seed System

The seed script populates the database with sample data for development and testing. ⚠️ **Do NOT run this in production!**

## Troubleshooting

### MySQL not found
```bash
# macOS (Homebrew)
brew install mysql

# Ubuntu/Debian
sudo apt-get install mysql-client
```

### Permission denied
```bash
# Grant proper MySQL permissions
mysql -u root -p -e "GRANT ALL PRIVILEGES ON assetcore_dev.* TO 'root'@'localhost';"
```

### Connection refused
- Check MySQL is running: `brew services list` (macOS) or `sudo systemctl status mysql` (Linux)
- Verify host and port in `.env.local`

## Next Steps

After setting up the database:
1. Update your `.env` file with database credentials
2. Test database connection in your application
3. Verify data with the test users
4. Start developing with the seeded data
