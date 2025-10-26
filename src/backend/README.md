# Backend Module

Backend business logic for AssetCore application.

## Overview

This directory contains all backend business logic following the layered architecture pattern. All business logic is framework-agnostic and can be migrated to external services without refactoring.

## Directory Structure

```
src/backend/
├── authentication.ts  # Authentication, login, token management
└── README.md         # This file
```

## Authentication Module

Location: `src/backend/authentication.ts`

### Features

- **JWT Token-Based Authentication**: Stateless authentication using minimal JWT tokens with only standard claims
- **Secure Password Hashing**: bcrypt with configurable salt rounds
- **Token Refresh**: Long-lived refresh tokens for seamless session management
- **Multi-Tenant Support**: Handles both tenant users and system administrators
- **User Management**: Registration, password changes, password reset
- **Minimal Token Claims**: Only contains user ID (`sub` claim) - user details fetched from database

### Environment Variables

Required environment variables for authentication:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d                    # Access token expiration (7 days)
JWT_REFRESH_EXPIRES_IN=30d          # Refresh token expiration (30 days)
```

### Core Functions

#### `login(credentials: Login): Promise<AuthResponse>`

Authenticate user with email and password.

```typescript
import { login } from '@/backend/authentication';

const result = await login({
  email: 'user@example.com',
  password: 'password123'
});

// Returns:
// {
//   user: User,
//   token: string,           // JWT access token
//   refreshToken: string,    // JWT refresh token
//   expiresIn: number        // Token expiration in seconds
// }
```

#### `refreshToken(refreshToken: string): Promise<RefreshTokenResponse>`

Refresh expired access token using refresh token.

```typescript
import { refreshToken } from '@/backend/authentication';

const result = await refreshToken(refreshTokenString);

// Returns:
// {
//   token: string,           // New JWT access token
//   refreshToken: string,    // New JWT refresh token
//   expiresIn: number        // Token expiration in seconds
// }
```

#### `verifyToken(token: string): JWTCustomClaims`

Verify and decode JWT token.

```typescript
import { verifyToken } from '@/backend/authentication';

const decoded = verifyToken(tokenString);

// Returns decoded token payload with standard JWT claims:
// - sub: user ID (subject)
// - iat: issued at timestamp
// - aud: audience
// - iss: issuer
// - exp: expiration timestamp
```

**Note**: JWT tokens contain only the user ID (`sub` claim). User details are fetched from the database when needed.

#### `register(userData: CreateUser): Promise<User>`

Register a new user account.

```typescript
import { register } from '@/backend/authentication';

const user = await register({
  email: 'newuser@example.com',
  password: 'securepassword123',
  first_name: 'John',
  last_name: 'Doe',
  user_type: 'tenant',
  system_role: null,
  system_permissions: null
});
```

#### `changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>`

Change user password with current password verification.

```typescript
import { changePassword } from '@/backend/authentication';

await changePassword(userId, 'oldpassword', 'newpassword');
```

#### `resetPassword(email: string, newPassword: string): Promise<void>`

Reset password for forgot password flow.

```typescript
import { resetPassword } from '@/backend/authentication';

await resetPassword('user@example.com', 'newpassword');
```

#### `getUserById(userId: string, includeCompanies?: boolean): Promise<User | UserWithCompanies | null>`

Get user by ID with optional company associations. Used to fetch full user details from database after extracting user ID from JWT token.

```typescript
import { getUserById } from '@/backend/authentication';

// Get user without companies
const user = await getUserById(userId);

// Get user with companies
const userWithCompanies = await getUserById(userId, true);
```

#### `getUserIdFromToken(token: string): string`

Extract user ID from JWT token using the `sub` claim.

```typescript
import { getUserIdFromToken } from '@/backend/authentication';

const userId = getUserIdFromToken(tokenString);
```

#### `getUserCompanies(userId: string): Promise<UserCompany[]>`

Get all company associations for a user.

```typescript
import { getUserCompanies } from '@/backend/authentication';

const companies = await getUserCompanies(userId);
```

### Auth Utilities

#### `authUtils.extractTokenFromHeader(authHeader: string | null): string | null`

Extract JWT token from Authorization header.

```typescript
import { authUtils } from '@/backend/authentication';

const authHeader = request.headers.get('authorization');
const token = authUtils.extractTokenFromHeader(authHeader);
```

#### `authUtils.createAuthContext(token: string): Promise<AuthContext>`

Create authentication context from JWT token. This function decodes the token, fetches the user from the database, and returns a complete auth context.

```typescript
import { authUtils } from '@/backend/authentication';

const context = await authUtils.createAuthContext(token);

// Returns:
// {
//   user: User | UserWithCompanies,
//   userId: string,
//   email: string,
//   userType: string,
//   systemRole: string | null,
//   companies: UserCompany[]
// }
```

### JWT Token Structure

JWT tokens in AssetCore use **only standard JWT claims** with minimal user data:

```json
{
  "sub": "user-uuid-here",
  "iat": 1234567890,
  "aud": "assetcore-client",
  "iss": "assetcore",
  "exp": 1234567890
}
```

**Token Claims:**
- `sub` - User ID (the only user-specific data in the token)
- `iat` - Issued at timestamp
- `aud` - Audience verification
- `iss` - Issuer verification
- `exp` - Expiration timestamp (automatically added by jwt library)

**Benefits of this approach:**
- ✅ Minimal token size
- ✅ Always current user data (fetched from database)
- ✅ No sensitive data in token
- ✅ User changes take immediate effect
- ✅ Revocation can be handled by checking user status in database

## Architecture Principles

### Framework Independence

All backend logic in this directory is:

- **Framework-Agnostic**: No Next.js dependencies
- **Stateless**: Functions operate independently without framework context
- **Pure Functions**: Easily testable and portable
- **Type-Safe**: Full TypeScript integration

### Database Access

All functions use the centralized database connection from `@/lib/db`:

```typescript
import { db } from '@/lib/db';

// Use parameterized queries for SQL injection prevention
const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
```

### Input Validation

All public functions validate input using Zod schemas:

```typescript
import { loginSchema } from '@/lib/validators/user';

const validatedData = loginSchema.parse(requestData);
```

## Security Considerations

### Password Security

- **Hashing**: bcrypt with 12 salt rounds
- **Comparison**: Constant-time comparison to prevent timing attacks
- **No Storage**: Plain passwords are never stored or logged

### JWT Token Security

- **Secret**: Strong secret stored in environment variables
- **Minimal Claims**: Tokens only contain user ID (`sub` claim) - no sensitive user data
- **Expiration**: Short-lived access tokens (7 days)
- **Refresh Tokens**: Long-lived but revocable (30 days)
- **Issuer/Audience**: Verified in token generation
- **User Details**: Fetched from database, not from token (always current data)

### SQL Injection Prevention

All database queries use parameterized prepared statements:

```typescript
// ✅ CORRECT
await db.execute('SELECT * FROM users WHERE email = ?', [email]);

// ❌ WRONG
await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

## Error Handling

All functions throw descriptive errors:

- **Authentication Errors**: `Error('Invalid email or password')`
- **Authorization Errors**: `Error('Account is inactive')`
- **Validation Errors**: `ZodError` from schema validation
- **Token Errors**: `Error('Token has expired')` or `Error('Invalid token')`

## Usage Examples

### API Route Handler (Next.js)

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/backend/authentication';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await login(body);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }
}
```

### Token Verification in API Route

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authUtils, getUserById, getUserIdFromToken } from '@/backend/authentication';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authUtils.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }
    
    // Extract user ID from token (uses 'sub' claim)
    const userId = getUserIdFromToken(token);
    
    // Fetch user details from database
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Use user data...
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

**Key Points:**
- JWT tokens only contain the user ID (`sub` claim)
- User details must be fetched from the database using `getUserById()`
- This ensures user data is always current and up-to-date

### Refresh Token Endpoint

```typescript
// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { refreshToken } from '@/backend/authentication';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken: token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }
    
    const result = await refreshToken(token);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }
}
```

## Testing

Authentication functions can be easily unit tested:

```typescript
import { login, verifyToken } from '@/backend/authentication';

describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const result = await login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
  });
  
  it('should verify valid token', () => {
    const decoded = verifyToken(validToken);
    expect(decoded.userId).toBeDefined();
  });
});
```

## Future Enhancements

Planned improvements:

- [ ] OAuth provider integration (Google, Microsoft, etc.)
- [ ] Multi-factor authentication (MFA)
- [ ] Session management and revocation
- [ ] Password strength validation
- [ ] Account lockout after failed attempts
- [ ] Email verification
- [ ] Two-factor authentication (2FA)

## Dependencies

- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **uuid**: Generate unique user IDs
- **zod**: Input validation
- **mysql2**: Database access (via lib/db)

## Related Files

- **Database Connection**: `src/lib/db.ts`
- **Validation Schemas**: `src/lib/validators/user.ts`
- **Type Definitions**: `src/types/user.ts`
- **Permission System**: `src/lib/permissions.ts`

