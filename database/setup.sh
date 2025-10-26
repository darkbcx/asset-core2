#!/bin/bash

# AssetCore Database Setup Script (Bash Version)
# This script helps you set up and initialize the AssetCore database
#
# NOTE: The TypeScript version (npm run db:init) is recommended for better
#       cross-platform compatibility and error handling.

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database configuration (can be overridden by environment variables)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-assetcore_dev}

echo -e "${GREEN}AssetCore Database Setup${NC}"
echo "=========================="
echo ""

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}Error: mysql command not found${NC}"
    echo "Please install MySQL client tools"
    exit 1
fi

# Prompt for password if not set
if [ -z "$DB_PASSWORD" ]; then
    echo -n "Enter MySQL root password: "
    read -s DB_PASSWORD
    echo ""
fi

# Test connection
echo "Testing MySQL connection..."
if ! mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" -e "SELECT 1" &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to MySQL server${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MySQL connection successful${NC}"
echo ""

# Create database
echo "Creating database '$DB_NAME'..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
echo -e "${GREEN}✓ Database created${NC}"
echo ""

# Run migrations
if [ -f "database/migrations/001_initial_schema.sql" ]; then
    echo "Running migrations..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" "$DB_NAME" < database/migrations/001_initial_schema.sql
    echo -e "${GREEN}✓ Migrations completed${NC}"
    echo ""
else
    echo -e "${YELLOW}Warning: Migration file not found${NC}"
fi

# Ask if user wants to seed data
echo -n "Do you want to seed the database with sample data? (y/N): "
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    if [ -f "database/seeds/001_initial_data.sql" ]; then
        echo "Seeding database..."
        mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" "$DB_NAME" < database/seeds/001_initial_data.sql
        echo -e "${GREEN}✓ Database seeded${NC}"
        echo ""
        
        # Display summary
        echo "=== Database Summary ==="
        mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" "$DB_NAME" <<EOF
SELECT 'Companies' as table_name, COUNT(*) as records FROM companies
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets
UNION ALL
SELECT 'Components', COUNT(*) FROM components
UNION ALL
SELECT 'Maintenance Records', COUNT(*) FROM maintenance_records;
EOF
    else
        echo -e "${YELLOW}Warning: Seed file not found${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Database setup complete!${NC}"
echo ""
echo "Test credentials:"
echo "  System Admin: admin@assetcore.com / Password123!"
echo "  Company Admin: john.doe@acme.com / Password123!"
echo ""
