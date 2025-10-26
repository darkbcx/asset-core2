#!/usr/bin/env tsx

/**
 * AssetCore Database Initialization Script
 * 
 * This script helps you set up and initialize the AssetCore database
 * by running migrations and optionally seeding sample data.
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
};

/**
 * Prompt user for password
 */
function promptPassword(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.stdoutMuted = true;
    rl.question('Enter MySQL root password: ', (password: string) => {
      rl.close();
      console.log('');
      resolve(password);
    });

    // Mute password input
    (rl as any)._writeToOutput = function (char: string) {
      if ((rl as any).stdoutMuted) {
        (rl as any).output.write('*');
      } else {
        (rl as any).output.write(char);
      }
    };
  });
}

/**
 * Prompt user for yes/no question
 */
function promptYesNo(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${question} (y/N): `, (answer: string) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Test MySQL connection
 */
async function testConnection(): Promise<mysql.Connection> {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });

    await connection.query('SELECT 1');
    return connection;
  } catch (error) {
    throw new Error(`Cannot connect to MySQL server: ${(error as Error).message}`);
  }
}

/**
 * Create database
 */
async function createDatabase(connection: mysql.Connection): Promise<void> {
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    log.success(`Database '${config.database}' created or already exists`);
  } catch (error) {
    throw new Error(`Failed to create database: ${(error as Error).message}`);
  }
}

/**
 * Read and execute SQL file
 */
async function executeSqlFile(
  connection: mysql.Connection,
  filePath: string
): Promise<void> {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Use query with multipleStatements: true to handle complex SQL files
    // This is necessary for files with functions, triggers, etc.
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      // Skip comments and empty statements
      const cleanStatement = statement
        .replace(/--.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .trim();

      if (cleanStatement.length > 0) {
        try {
          // Use execute for prepared statements support
          await connection.execute(cleanStatement);
        } catch (error) {
          // Log but continue for non-critical errors
          const errorMessage = (error as Error).message;
          // Ignore errors for existing objects, duplicates, etc.
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
  } catch (error) {
    throw new Error(`Failed to execute SQL file: ${(error as Error).message}`);
  }
}

/**
 * Run migrations
 */
async function runMigrations(connection: mysql.Connection): Promise<void> {
  const migrationFile = path.join(__dirname, '../migrations/001_initial_schema.sql');
  
  if (!fs.existsSync(migrationFile)) {
    throw new Error(`Migration file not found: ${migrationFile}`);
  }

  log.info('Running migrations...');
  await executeSqlFile(connection, migrationFile);
  log.success('Migrations completed');
}

/**
 * Seed database with sample data
 */
async function seedDatabase(connection: mysql.Connection): Promise<void> {
  const seedFile = path.join(__dirname, '../seeds/001_initial_data.sql');
  
  if (!fs.existsSync(seedFile)) {
    log.warn('Seed file not found, skipping...');
    return;
  }

  log.info('Seeding database...');
  await executeSqlFile(connection, seedFile);
  log.success('Database seeded');
}

/**
 * Display database summary
 */
async function displaySummary(connection: mysql.Connection): Promise<void> {
  try {
    const [rows] = await connection.query(`
      SELECT 
        'Companies' as table_name, COUNT(*) as records FROM companies
      UNION ALL
      SELECT 'Users', COUNT(*) FROM users
      UNION ALL
      SELECT 'User Companies', COUNT(*) FROM user_companies
      UNION ALL
      SELECT 'Locations', COUNT(*) FROM locations
      UNION ALL
      SELECT 'Assets', COUNT(*) FROM assets
      UNION ALL
      SELECT 'Components', COUNT(*) FROM components
      UNION ALL
      SELECT 'Maintenance Records', COUNT(*) FROM maintenance_records
    `);

    console.log('\n=== Database Summary ===');
    console.table(rows);
  } catch (error) {
    log.warn('Could not display summary');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.blue}AssetCore Database Setup${colors.reset}`);
  console.log('==========================\n');

  let connection: mysql.Connection | null = null;

  try {
    // Prompt for password if not set
    if (!config.password) {
      config.password = await promptPassword();
    }

    // Test connection
    log.info('Testing MySQL connection...');
    connection = await testConnection();
    log.success('MySQL connection successful\n');

    // Create database
    log.info(`Creating database '${config.database}'...`);
    await createDatabase(connection);
    console.log('');

    // Switch to the database
    await connection.query(`USE \`${config.database}\``);

    // Run migrations
    await runMigrations(connection);
    console.log('');

    // Ask if user wants to seed data
    const shouldSeed = await promptYesNo('Do you want to seed the database with sample data?');
    
    if (shouldSeed) {
      await seedDatabase(connection);
      console.log('');
      await displaySummary(connection);
    }

    console.log(`\n${colors.green}Database setup complete!${colors.reset}`);
    console.log('\nTest credentials:');
    console.log('  System Admin: admin@assetcore.com / Password123!');
    console.log('  Company Admin: john.doe@acme.com / Password123!');
    console.log('  Asset Manager: jane.smith@acme.com / Password123!');
    console.log('  Maintenance Tech: mike.johnson@acme.com / Password123!\n');
  } catch (error) {
    log.error((error as Error).message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
main().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
