# Database Connector

## Database Configuration

Create a `.env` or `.env.local` file in the project root with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=asset_core
DB_CONNECTION_LIMIT=10

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

## Usage

### Basic Query with Prepared Statements

```typescript
import { db } from '@/lib/db';

// ✅ CORRECT: Use parameterized queries
const [rows] = await db.execute(
  'SELECT * FROM assets WHERE company_id = ? AND status = ?',
  [companyId, 'operational']
);
```

### Get Single Row

```typescript
// Get one asset
const asset = await db.queryOne<Asset>(
  'SELECT * FROM assets WHERE id = ?',
  [assetId]
);
```

### Transaction

```typescript
// Execute multiple queries in a transaction
const results = await db.transaction([
  { sql: 'INSERT INTO assets (name) VALUES (?)', params: ['Asset 1'] },
  { sql: 'INSERT INTO assets (name) VALUES (?)', params: ['Asset 2'] },
]);
```

### Manual Transaction

```typescript
// Advanced transaction control
await db.withTransaction(async (connection) => {
  await connection.execute('INSERT INTO assets ...', [...]);
  await connection.execute('INSERT INTO components ...', [...]);
  return result;
});
```

## Security: SQL Injection Prevention

### ✅ CORRECT - Use Parameterized Queries

```typescript
// Use ? placeholders with db.execute()
const [rows] = await db.execute(
  'SELECT * FROM assets WHERE company_id = ? AND status = ?',
  [companyId, status]
);
```

### ❌ WRONG - String Concatenation (Vulnerable to SQL Injection)

```typescript
// NEVER do this with user input
const sql = `SELECT * FROM assets WHERE company_id = ${companyId}`;
const [rows] = await db.query(sql);
```

## Testing Connection

```typescript
import { db } from '@/lib/db';

// Test connection on app startup
const isConnected = await db.testConnection();
console.log('Database connected:', isConnected);
```

