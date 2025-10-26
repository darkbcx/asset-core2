#!/usr/bin/env tsx

/**
 * AssetCore Database Utilities
 * 
 * Helper script for database operations like migrate, seed, reset, backup, etc.
 */

import mysql, { ConnectionOptions, RowDataPacket } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'assetcore_dev',
};

// Helper functions
const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
};

/**
 * Get MySQL connection
 */
async function getConnection(useDatabase = false): Promise<mysql.Connection> {
  const connectionConfig: ConnectionOptions = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true,
  };

  if (useDatabase) {
    connectionConfig.database = config.database;
  }

  return await mysql.createConnection(connectionConfig);
}

/**
 * Execute SQL file
 */
async function executeSqlFile(
  connection: mysql.Connection,
  filePath: string
): Promise<void> {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    const cleanStatement = statement
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    if (cleanStatement.length > 0) {
      try {
        await connection.query(cleanStatement);
      } catch (error) {
        const errorMessage = (error as Error).message;
        if (
          !errorMessage.includes('already exists') &&
          !errorMessage.includes('Duplicate') &&
          !errorMessage.includes('Unknown database')
        ) {
          log.warn(`Warning: ${errorMessage.substring(0, 100)}`);
        }
      }
    }
  }
}

/**
 * Run migrations only
 */
async function migrate(): Promise<void> {
  const connection = await getConnection(true);
  const migrationFile = path.join(__dirname, '../migrations/001_initial_schema.sql');
  
  if (!fs.existsSync(migrationFile)) {
    throw new Error(`Migration file not found: ${migrationFile}`);
  }

  log.step('Running migrations...');
  await executeSqlFile(connection, migrationFile);
  log.success('Migrations completed');
  
  await connection.end();
}

/**
 * Seed database only
 */
async function seed(): Promise<void> {
  const connection = await getConnection(true);
  const seedFile = path.join(__dirname, '../seeds/001_initial_data.sql');
  
  if (!fs.existsSync(seedFile)) {
    log.warn('Seed file not found');
    await connection.end();
    return;
  }

  log.step('Seeding database...');
  await executeSqlFile(connection, seedFile);
  log.success('Database seeded');
  
  await connection.end();
}

/**
 * Reset database (drop, create, migrate, seed)
 */
async function reset(): Promise<void> {
  log.info('Resetting database...');
  
  const connection = await getConnection(false);
  
  // Drop database
  log.step('Dropping database...');
  await connection.query(`DROP DATABASE IF EXISTS \`${config.database}\``);
  
  // Create database
  log.step('Creating database...');
  await connection.query(
    `CREATE DATABASE \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  log.success(`Database '${config.database}' created`);
  
  // Switch to database
  await connection.query(`USE \`${config.database}\``);
  
  // Run migrations
  await migrate();
  console.log('');
  
  // Seed database
  await seed();
  
  await connection.end();
  log.success('Database reset complete');
}

/**
 * Backup database
 */
async function backup(): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupFile = `backup_${config.database}_${timestamp}.sql`;
  
  log.step(`Creating backup: ${backupFile}`);
  
  const command = `mysqldump -u ${config.user} -p${config.password} -h ${config.host} ${config.database} > ${backupFile}`;
  
  try {
    execSync(command, { stdio: 'inherit' });
    log.success(`Backup created: ${backupFile}`);
  } catch (error) {
    log.error('Backup failed');
    throw error;
  }
}

/**
 * Show database status
 */
async function status(): Promise<void> {
  const connection = await getConnection(true);
  
  log.info('Database Status\n');
  
  try {
    const [tables] = await connection.query<(RowDataPacket & { TABLE_NAME: string; TABLE_ROWS: number })[]>(
      "SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [config.database]
    );

    console.table(tables.map(t => ({
      Table: t.TABLE_NAME,
      Rows: t.TABLE_ROWS || 0,
    })));

    const [summary] = await connection.query<(RowDataPacket & { table_name: string; records: number })[]>(`
      SELECT 
        'Companies' as table_name, COUNT(*) as records FROM companies
      UNION ALL
      SELECT 'Users', COUNT(*) FROM users
      UNION ALL
      SELECT 'Assets', COUNT(*) FROM assets
      UNION ALL
      SELECT 'Components', COUNT(*) FROM components
      UNION ALL
      SELECT 'Maintenance Records', COUNT(*) FROM maintenance_records
    `);

    console.log('\n=== Summary ===');
    console.table(summary);
  } catch (error) {
    console.error(error);
    log.error('Could not get database status');
  }
  
  await connection.end();
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];

  if (!config.password) {
    log.error('DB_PASSWORD environment variable is required');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'migrate':
        await migrate();
        break;
      case 'seed':
        await seed();
        break;
      case 'reset':
        await reset();
        break;
      case 'backup':
        await backup();
        break;
      case 'status':
        await status();
        break;
      default:
        console.log(`${colors.blue}AssetCore Database Utils${colors.reset}`);
        console.log('==========================\n');
        console.log('Usage: tsx database/scripts/db-utils.ts <command>\n');
        console.log('Commands:');
        console.log('  migrate  - Run database migrations');
        console.log('  seed     - Seed database with sample data');
        console.log('  reset    - Drop, create, migrate, and seed database');
        console.log('  backup   - Create database backup');
        console.log('  status   - Show database status and tables');
        process.exit(0);
    }
  } catch (error) {
    log.error((error as Error).message);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
