# Database Scripts Reference

Quick reference guide for all database-related scripts and commands.

## Quick Start

For first-time setup, use the interactive initialization:
```bash
npm run db:init
```

## All Commands

### 1. Database Initialization (Interactive)

**Script:** `database/scripts/init-db.ts`  
**Command:** `npm run db:init`

Interactive setup that guides you through:
- MySQL connection testing
- Database creation
- Running migrations
- Optional seeding

**Best for:** First-time setup or new developers

---

### 2. Run Migrations

**Script:** `database/scripts/db-utils.ts migrate`  
**Command:** `npm run db:migrate`  
**Requires:** `DB_PASSWORD` environment variable

Runs all pending migrations to update database schema.

**Usage:**
```bash
DB_PASSWORD=yourpass npm run db:migrate
```

---

### 3. Seed Database

**Script:** `scripts/db-utils.ts seed`  
**Command:** `npm run db:seed`  
**Requires:** `DB_PASSWORD` environment variable

Populates database with sample data for development/testing.

**Usage:**
```bash
DB_PASSWORD=yourpass npm run db:seed
```

**Seeded Data:**
- 2 Companies (Acme Aviation, Global Logistics)
- 5 Users (1 system admin + 4 tenant users)
- 3 Locations
- 2 Assets (Boeing 737, Ground Support Vehicle)
- 4 Components
- 2 Maintenance Records
- Sample transfers and audit logs

---

### 4. Reset Database

**Script:** `scripts/db-utils.ts reset`  
**Command:** `npm run db:reset`  
**Requires:** `DB_PASSWORD` environment variable

⚠️ **WARNING: This will delete all data!**

Performs complete database reset:
1. Drops database
2. Creates fresh database
3. Runs all migrations
4. Seeds sample data

**Usage:**
```bash
DB_PASSWORD=yourpass npm run db:reset
```

**Best for:** Clean slate development, testing, or fixing corrupted data

---

### 5. Backup Database

**Script:** `scripts/db-utils.ts backup`  
**Command:** `npm run db:backup`  
**Requires:** `DB_PASSWORD` environment variable

Creates a SQL dump of the entire database.

**Usage:**
```bash
DB_PASSWORD=yourpass npm run db:backup
```

**Output:** `backup_<database_name>_<date>.sql`

**Best for:** Before major changes, deployments, or critical updates

---

### 6. Database Status

**Script:** `scripts/db-utils.ts status`  
**Command:** `npm run db:status`  
**Requires:** `DB_PASSWORD` environment variable

Shows detailed database information:
- All tables and row counts
- Summary of key entities

**Usage:**
```bash
DB_PASSWORD=yourpass npm run db:status
```

**Best for:** Checking database health, verifying data, debugging

---

### 7. Help

**Script:** `scripts/db-utils.ts`  
**Command:** `npm run db:help`

Displays available commands and usage information.

**Usage:**
```bash
npm run db:help
```

---

## Environment Variables

All scripts support the following environment variables:

```bash
DB_HOST=localhost          # Database host
DB_PORT=3306              # Database port
DB_USER=root              # Database user
DB_PASSWORD=yourpass      # Database password (required for db:utils commands)
DB_NAME=assetcore_dev     # Database name
```

### Setting Environment Variables

**Option 1: Inline**
```bash
DB_PASSWORD=mysecret npm run db:migrate
```

**Option 2: .env file**
Create a `.env` file in project root:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mysecret
DB_NAME=assetcore_dev
```

**Option 3: Export in shell**
```bash
export DB_PASSWORD=mysecret
npm run db:migrate
```

---

## Common Workflows

### First Time Setup
```bash
# Run interactive initialization
npm run db:init
```

### Update Schema After Changes
```bash
# Run migrations to apply changes
DB_PASSWORD=mysecret npm run db:migrate
```

### Add Sample Data
```bash
# Seed with development data
DB_PASSWORD=mysecret npm run db:seed
```

### Complete Reset
```bash
# Drop everything and start fresh
DB_PASSWORD=mysecret npm run db:reset
```

### Before Major Changes
```bash
# Create backup first
DB_PASSWORD=mysecret npm run db:backup

# Make your changes...

# If something goes wrong, restore
mysql -u root -p assetcore_dev < backup_assetcore_dev_2024-01-15.sql
```

### Check Database Health
```bash
# View tables and record counts
DB_PASSWORD=mysecret npm run db:status
```

---

## Troubleshooting

### "DB_PASSWORD environment variable is required"

Set the password:
```bash
export DB_PASSWORD=yourpassword
```

Or inline:
```bash
DB_PASSWORD=yourpassword npm run db:migrate
```

### "Cannot connect to MySQL server"

Check:
1. MySQL is running: `brew services list` (macOS) or `sudo systemctl status mysql` (Linux)
2. Correct host and port in environment variables
3. User has proper permissions

### "Database already exists"

Use reset command:
```bash
DB_PASSWORD=yourpass npm run db:reset
```

### Migration fails

Check:
1. Database exists
2. SQL syntax in migration file
3. User permissions
4. Foreign key constraints

---

## Security Notes

- ⚠️ Never commit `.env` files with real passwords
- ⚠️ Use strong passwords in production
- ⚠️ Limit database user permissions to minimum required
- ⚠️ Regular backups before major changes
- ✅ Use different credentials for dev/staging/production

---

## Advanced Usage

### Multiple Environments

Create different `.env` files:
```bash
# .env.development
DB_NAME=assetcore_dev

# .env.production
DB_NAME=assetcore_prod

# Use specific env file
cp .env.production .env
npm run db:migrate
```

### Custom Database Name

```bash
DB_NAME=my_custom_db DB_PASSWORD=pass npm run db:init
```

### Remote Database

```bash
DB_HOST=db.example.com DB_PORT=3306 DB_USER=admin DB_PASSWORD=secret npm run db:status
```
