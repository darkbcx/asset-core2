/**
 * Database Connector
 * 
 * MySQL database connection using mysql2 with connection pooling
 * Supports prepared statements for SQL injection prevention
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database configuration from environment variables
 */
const dbConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asset_core',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: false, // Security: Prevent multiple statements
  charset: 'utf8mb4',
  timezone: '+00:00', // UTC
  dateStrings: true, // Return dates as strings
};

/**
 * Create connection pool
 */
const pool = mysql.createPool(dbConfig);

/**
 * Database connection instance
 */
export const db = {
  /**
   * Execute a query with prepared statements
   * @param sql - SQL query with placeholders (?, ?, ?)
   * @param params - Parameters for the query
   * @returns Query result with rows and metadata
   */
  async execute<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<[T[], mysql.RowDataPacket[]]> {
    try {
      const [rows] = await pool.execute(sql, params);
      return [rows as T[], []];
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  },

  /**
   * Execute a query without prepared statements (use with caution)
   * @param sql - SQL query
   * @param params - Parameters for the query
   * @returns Query result
   */
  async query<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<[T[], mysql.FieldPacket[]]> {
    try {
      const [rows] = await pool.query(sql, params);
      return [rows as T[], []];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  /**
   * Get a single row from a query
   * @param sql - SQL query with placeholders
   * @param params - Parameters for the query
   * @returns Single row or null
   */
  async queryOne<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<T | null> {
    const [rows] = await this.execute<T>(sql, params);
    return rows[0] || null;
  },

  /**
   * Execute multiple queries in a transaction
   * @param queries - Array of query objects
   * @returns Transaction result
   */
  async transaction<T>(
    queries: Array<{ sql: string; params?: unknown[] }>
  ): Promise<T[]> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const results: T[] = [];
      
      for (const query of queries) {
        const [rows] = await connection.execute(query.sql, query.params);
        results.push((rows as T[])[0] as T);
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Execute a query within a transaction manually
   * @param callback - Function that receives a connection
   * @returns Result from callback
   */
  async withTransaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Get connection from pool (for advanced usage)
   * @returns Database connection
   */
  async getConnection(): Promise<mysql.PoolConnection> {
    return await pool.getConnection();
  },

  /**
   * Test database connection
   * @returns Connection status
   */
  async testConnection(): Promise<boolean> {
    try {
      await pool.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    await pool.end();
  },
};

/**
 * Helper function to escape SQL identifiers
 * WARNING: Only use for known safe identifiers, not user input
 */
export function escapeId(value: string): string {
  return mysql.escapeId(value);
}

/**
 * Helper function to escape SQL values
 * NOTE: Use parameterized queries instead when possible
 */
export function escape(value: unknown): string {
  return mysql.escape(value);
}

/**
 * Type guards for database results
 */
export function isRowDataPacket(data: unknown): data is mysql.RowDataPacket {
  return Boolean(data && typeof data === 'object');
}

/**
 * Database query result metadata
 */
export interface QueryResult<T = unknown> {
  data: T[];
  meta: {
    affectedRows: number;
    insertId: number;
    changedRows: number;
  };
}

/**
 * Execute a query and return typed result with metadata
 */
export async function executeQuery<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const connection = await pool.getConnection();
  
  try {
    const [rows, meta] = await connection.execute(sql, params);
    const result = meta as unknown as mysql.ResultSetHeader;
    
    return {
      data: rows as T[],
      meta: {
        affectedRows: result.affectedRows,
        insertId: result.insertId,
        changedRows: result.changedRows,
      },
    };
  } finally {
    connection.release();
  }
}

/**
 * SQL Injection Prevention Helper
 * 
 * Always use parameterized queries:
 * 
 * ✅ CORRECT:
 * const [rows] = await db.execute(
 *   'SELECT * FROM assets WHERE company_id = ? AND status = ?',
 *   [companyId, status]
 * );
 * 
 * ❌ WRONG:
 * const sql = `SELECT * FROM assets WHERE company_id = ${companyId}`;
 * const [rows] = await db.query(sql);
 */

export default db;

