# Quick Start Guide - Database Setup

## 🚀 Quick Setup (Recommended)

Run the TypeScript initialization script:

```bash
npm run db:init
```

Or directly with tsx:

```bash
npx tsx database/scripts/init-db.ts
```

The script will:
1. Test MySQL connection
2. Create the database
3. Run all migrations
4. Optionally seed sample data

**Note:** You can still use the bash script if you prefer:
```bash
bash database/setup.sh
```

## 📋 Manual Setup

### 1. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE assetcore_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Run Migrations

```bash
mysql -u root -p assetcore_dev < database/migrations/001_initial_schema.sql
```

### 3. Seed Data (Optional)

```bash
mysql -u root -p assetcore_dev < database/seeds/001_initial_data.sql
```

## 🔐 Test Credentials

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

## 📊 What Gets Created

### Tables (14 total)
- ✅ Companies (tenants)
- ✅ Users (with dual type support)
- ✅ User-Companies (associations)
- ✅ Locations (hierarchical)
- ✅ Assets
- ✅ Components
- ✅ Maintenance Records
- ✅ Component Transfers
- ✅ Maintenance Attachments
- ✅ Files (entity-agnostic)
- ✅ File Versions
- ✅ File Access Logs
- ✅ Audit Logs

### Sample Data
- ✅ 2 Companies
- ✅ 5 Users (1 sys admin + 4 tenants)
- ✅ 3 Locations
- ✅ 2 Assets
- ✅ 4 Components
- ✅ 2 Maintenance Records
- ✅ 1 Component Transfer
- ✅ Sample audit logs

## 🛠️ NPM Scripts

```bash
# Initialize database (recommended - interactive setup)
npm run db:init

# Run migrations only
npm run db:migrate

# Seed data only
npm run db:seed

# Reset database (drop, create, migrate, seed)
npm run db:reset

# Create backup
npm run db:backup

# Show database status
npm run db:status

# Show help for all commands
npm run db:help
```

**Note:** For `db:migrate`, `db:seed`, `db:reset`, `db:backup`, and `db:status`, you need to set the `DB_PASSWORD` environment variable:
```bash
DB_PASSWORD=yourpass npm run db:migrate
```

## ✅ Verify Setup

```bash
# Check tables
mysql -u root -p assetcore_dev -e "SHOW TABLES;"

# Check row counts
mysql -u root -p assetcore_dev -e "
SELECT 
    'Companies' as table_name, COUNT(*) as records FROM companies
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets;
"
```

## 🐛 Troubleshooting

### MySQL not found
```bash
# macOS (Homebrew)
brew install mysql

# Ubuntu/Debian
sudo apt-get install mysql-client
```

### Permission denied
```bash
# Make sure you have proper MySQL permissions
mysql -u root -p -e "GRANT ALL PRIVILEGES ON assetcore_dev.* TO 'root'@'localhost';"
```

### Connection refused
- Check MySQL is running: `brew services start mysql` (macOS) or `sudo service mysql start` (Linux)
- Verify host/port in `.env`

## 📝 Environment Variables

Create/update `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=assetcore_dev
```

## 🔄 Reset Database

Want to start fresh?

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS assetcore_dev;"
npm run db:init
```

## 📖 More Information

See [README.md](./README.md) for detailed documentation.
