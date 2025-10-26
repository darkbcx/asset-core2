#!/usr/bin/env tsx

/**
 * Database Reset Script
 *
 * Drops all tables in the database and optionally re-runs migrations and seeds.
 * ⚠️ WARNING: This will delete all data!
 *
 * Usage:
 *   yarn reset        # Drop all tables
 *   yarn reset:full   # Drop tables, re-run migrations and seeds
 */

import mysql, { RowDataPacket } from "mysql2/promise";
import dotenv from "dotenv";

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
}

/**
 * Gets all table names in the database
 */
async function getAllTables(connection: mysql.Connection): Promise<string[]> {
  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
  );
  return rows.map((row) => row.TABLE_NAME as string);
}

/**
 * Drops all tables in the database
 */
async function dropAllTables(connection: mysql.Connection): Promise<void> {
  // Disable foreign key checks temporarily
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");

  const tables = await getAllTables(connection);

  if (tables.length === 0) {
    console.log("✓ No tables to drop");
    return;
  }

  console.log(`🗑️  Dropping ${tables.length} tables...\n`);

  for (const table of tables) {
    console.log(`   Dropping: ${table}`);
    await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
  }

  // Re-enable foreign key checks
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

  console.log("\n✅ All tables dropped");
}

/**
 * Main reset runner
 */
async function resetDatabase(fullReset: boolean = false): Promise<void> {
  const dbName = process.env.DB_NAME || "assetcore_dev";

  // First, connect without database to create it if needed
  const adminConnection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    console.log("🔄 Starting database reset...\n");

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
      // Drop all tables
      await dropAllTables(connection);

      if (fullReset) {
        console.log("\n" + "=".repeat(50));
        console.log("🔄 Starting full reset (migrations + seeds)...\n");
        console.log("=".repeat(50));

        await connection.end();

        // Import and run migrations
        const { runMigrations } = await import("./migrate");
        await runMigrations();

        // Import and run seeds
        const { seed } = await import("./seed");
        await seed();
      }

      console.log("\n" + "=".repeat(50));
      console.log("🎉 Database reset complete!");
      console.log("=".repeat(50));
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("\n❌ Reset process failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Load environment variables
  dotenv.config({ path: ".env.local" });

  const fullReset = process.argv.includes(":full") || process.argv.includes("--full");
  
  resetDatabase(fullReset).catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { resetDatabase };

