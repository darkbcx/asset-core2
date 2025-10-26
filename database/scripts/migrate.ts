#!/usr/bin/env tsx

/**
 * Database Migration Runner
 *
 * This script runs all pending SQL migrations in order.
 * Tracks executed migrations in the 'migrations' table.
 *
 * Usage:
 *   yarn migrate
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import mysql, { RowDataPacket } from "mysql2/promise";
import dotenv from "dotenv";

interface Migration {
  id: number;
  filename: string;
  executed_at: Date;
}

/**
 * Creates the database if it doesn't exist
 */
async function createDatabaseIfNotExists(
  connection: mysql.Connection,
  databaseName: string
): Promise<void> {
  await connection.execute(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`✓ Database '${databaseName}' ready`);
}

/**
 * Creates the migrations tracking table if it doesn't exist
 */
async function createMigrationsTable(
  connection: mysql.Connection
): Promise<void> {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

/**
 * Gets list of already executed migrations
 */
async function getExecutedMigrations(
  connection: mysql.Connection
): Promise<Migration[]> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    "SELECT * FROM migrations ORDER BY id ASC"
  );
  return rows.map((row): Migration => ({
    id: row.id,
    filename: row.filename,
    executed_at: row.executed_at,
  }));
}

/**
 * Executes a single migration file
 */
async function executeMigration(
  connection: mysql.Connection,
  id: number,
  filename: string,
  sql: string
): Promise<void> {
  console.log(`🔄 Executing migration: ${filename}`);

  try {
    await connection.beginTransaction();

    // Execute the entire SQL file at once (multipleStatements: true allows this)
    await connection.query(sql);

    // Record migration
    await connection.execute(
      "INSERT INTO migrations (id, filename) VALUES (?, ?)",
      [id, filename]
    );

    await connection.commit();
    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    await connection.rollback();
    console.error(`❌ Migration failed: ${filename}`, error);
    throw error;
  }
}

/**
 * Main migration runner
 */
async function runMigrations(): Promise<void> {
  const dbName = process.env.DB_NAME || "assetcore_dev";
  
  // First, connect without database to create it if needed
  const adminConnection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    console.log("🚀 Starting database migrations...\n");
    
    // Create database if it doesn't exist
    await createDatabaseIfNotExists(adminConnection, dbName);
    await adminConnection.end();

    // Now connect to the specific database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: dbName,
      multipleStatements: true,
    });

    try {
      // Create migrations table
      await createMigrationsTable(connection);

      // Get executed migrations
      const executed = await getExecutedMigrations(connection);
      const executedIds = new Set(executed.map((m) => m.id));

      console.log(`📊 Found ${executed.length} executed migrations\n`);

      // Get all migration files
      const migrationsDir = join(__dirname, "../migrations");
      const files = await readdir(migrationsDir);
      const migrationFiles = files.filter((f) => f.endsWith(".sql")).sort();

      console.log(`📁 Found ${migrationFiles.length} migration files\n`);

      let executedCount = 0;
      let skippedCount = 0;

      // Execute pending migrations
      for (const filename of migrationFiles) {
        const match = filename.match(/^(\d+)_/);
        if (!match) {
          console.warn(`⚠️  Skipping invalid migration filename: ${filename}`);
          continue;
        }

        const id = parseInt(match[1], 10);

        if (executedIds.has(id)) {
          console.log(`⏭️  Skipping already executed: ${filename}`);
          skippedCount++;
          continue;
        }

        // Read and execute migration
        const sql = await readFile(join(migrationsDir, filename), "utf-8");
        await executeMigration(connection, id, filename, sql);
        executedCount++;
      }

      console.log("\n" + "=".repeat(50));
      console.log(`🎉 Migrations completed!`);
      console.log(`   • Executed: ${executedCount}`);
      console.log(`   • Skipped:  ${skippedCount}`);
      console.log(`   • Total:    ${migrationFiles.length}`);
      console.log("=".repeat(50));
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("\n❌ Migration process failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Load environment variables
  dotenv.config({ path: ".env.local" });

  runMigrations().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { runMigrations };

