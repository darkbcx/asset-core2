# Role Values Reference

This document explains the role values used in the database and how they map to TypeScript types.

## Type Definitions

Roles are defined in `src/types/user.ts`:

### System Roles (for System Administrators)

```typescript
export type SystemRole = 'super_admin' | 'support_admin' | null;
```

- `'super_admin'` - Full platform access
- `'support_admin'` - Read-only support access
- `null` - Tenant users (not system administrators)

### Tenant Roles (for Tenant Users)

```typescript
export type TenantRole = 
  | 'company_admin'
  | 'asset_manager'
  | 'operations_supervisor'
  | 'maintenance_technician';
```

- `'company_admin'` - Full company administrative access
- `'asset_manager'` - Asset portfolio oversight
- `'operations_supervisor'` - Operational monitoring
- `'maintenance_technician'` - Field maintenance execution

## Database Storage

### Users Table

- **system_role** (VARCHAR(50), nullable): System role for admins
  - Values: `'super_admin'`, `'support_admin'`, or `NULL` (for tenant users)

### UserCompanies Table

- **role** (VARCHAR(50), NOT NULL): Tenant role within the company
  - Values: `'company_admin'`, `'asset_manager'`, `'operations_supervisor'`, `'maintenance_technician'`

## Seed Data Roles

The seed file (`database/seeds/001_initial_data.sql`) includes:

### System Administrator
- Email: `admin@assetcore.com`
- system_role: `'super_admin'`

### Tenant Users (Acme Aviation)

1. **John Doe** - Company Administrator
   - Email: `john.doe@acme.com`
   - role: `'company_admin'`

2. **Jane Smith** - Asset Manager
   - Email: `jane.smith@acme.com`
   - role: `'asset_manager'`

3. **Mike Johnson** - Maintenance Technician
   - Email: `mike.johnson@acme.com`
   - role: `'maintenance_technician'`

### Tenant Users (Global Logistics)

1. **Sarah Lee** - Company Administrator
   - Email: `sarah.lee@globallogistics.com`
   - role: `'company_admin'`

## Usage in Code

### Type Guards

```typescript
import { isSystemAdmin, isSuperAdmin, isSupportAdmin } from '@/types/user';

// Check user type
if (isSystemAdmin(user)) {
  // User is system administrator
  if (isSuperAdmin(user)) {
    // User is super admin
  }
  if (isSupportAdmin(user)) {
    // User is support admin
  }
}
```

### Role Checking

```typescript
// Check tenant user role
const userCompany = user.companies?.find(c => c.company_id === companyId);
if (userCompany?.role === 'company_admin') {
  // User is company administrator
}
```

## Validation

Role values should always match the TypeScript types:

- ✅ Use snake_case (e.g., `'company_admin'`)
- ✅ Use lowercase only
- ✅ Match exactly with TypeScript definitions
- ❌ Don't use spaces (e.g., `'Company Administrator'`)
- ❌ Don't use PascalCase (e.g., `'CompanyAdmin'`)

## Migration from Old Values

If you have existing data with old role names:

```sql
-- Update old role names to new format
UPDATE user_companies 
SET role = 'company_admin' 
WHERE role = 'Company Administrator';

UPDATE user_companies 
SET role = 'asset_manager' 
WHERE role = 'Asset Manager';

UPDATE user_companies 
SET role = 'maintenance_technician' 
WHERE role = 'Maintenance Technician';
```
