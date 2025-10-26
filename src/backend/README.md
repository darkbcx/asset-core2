# Backend Logic

Business logic and data access layer for AssetCore.

## Standard Response Pattern

**All backend functions must return a standardized response object:**

```typescript
// Import from shared types file
import type { BackendResponse } from '@/backend/types';

interface BackendResponse<T> {
  success: boolean;
  result?: T;
  error?: string;
}
```

### Response Rules

1. **Success Responses:**
   - Set `success: true`
   - Include data in `result` field
   - Omit `error` field

2. **Error Responses:**
   - Set `success: false`
   - Include error message in `error` field
   - Omit `result` field

3. **Example Usage:**

```typescript
import type { BackendResponse } from '@/backend/types';
import type { User } from '@/lib/validators/user';

// Success case
export async function getUserById(id: string): Promise<BackendResponse<User>> {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    return {
      success: true,
      result: user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
    };
  }
}
```

### Benefits

- **Consistent Error Handling**: All functions follow the same pattern
- **Type Safety**: Clear typing for success and error cases
- **Easy Testing**: Predictable response structure
- **Better UX**: Consistent error messages across the application

## Module Organization

```
src/backend/
├── authentication.ts    # JWT authentication & token management
├── user.ts             # User management & queries
├── assets.ts           # Asset management
├── components.ts       # Component management
└── maintenance.ts      # Maintenance record management
```

## Database Access

All database operations use prepared statements to prevent SQL injection:

```typescript
import { db } from '@/lib/db';

const query = 'SELECT * FROM users WHERE id = ? AND company_id = ?';
const [rows] = await db.execute(query, [userId, companyId]);
```

## Error Handling

- Always wrap async operations in try-catch blocks
- Return standardized error responses
- Log errors for debugging
- Never expose sensitive information in error messages

