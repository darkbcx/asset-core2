/**
 * Role-Based Permissions
 * 
 * Permission arrays for each role in the AssetCore system
 * Used for RBAC (Role-Based Access Control) implementation
 */

/**
 * Permission format: [entity]:[action]
 * Examples:
 * - assets:create, assets:read, assets:update, assets:delete
 * - maintenance:assign, maintenance:schedule
 * - users:manage, users:invite
 */

// ==========================================
// System Administrator Permissions
// ==========================================

/**
 * Super Administrator Permissions
 * Full access to all platform features and data
 */
export const SUPER_ADMIN_PERMISSIONS = ['*:*'];

/**
 * Support Administrator Permissions
 * Read-only access for troubleshooting and support
 */
export const SUPPORT_ADMIN_PERMISSIONS = [
  '*:read',          // Read access to all entities
  'users:update',    // Update user information for support
  'system:monitor',  // System monitoring access
];

// ==========================================
// Tenant User Permissions
// ==========================================

/**
 * Company Administrator Permissions
 * Full administrative access within company scope
 */
export const COMPANY_ADMIN_PERMISSIONS = [
  // Assets
  'assets:*',              // All asset permissions
  'assets:import',         // Bulk import
  'assets:export',         // Bulk export
  
  // Components
  'components:*',          // All component permissions
  'components:transfer',    // Component transfers
  
  // Maintenance
  'maintenance:*',         // All maintenance permissions
  'maintenance:assign',    // Assign technicians
  'maintenance:schedule',  // Schedule maintenance
  
  // Users
  'users:*',               // All user management
  'users:manage',          // Manage users
  'users:invite',          // Invite users
  'users:configure',       // Configure roles/permissions
  
  // Companies
  'companies:read',        // Read company info
  'companies:update',      // Update company settings
  'companies:configure',   // Configure settings
  
  // Files
  'files:*',               // All file operations
  
  // Reports
  'reports:*',             // All reports
  'reports:generate',      // Generate reports
  'reports:export',        // Export reports
];

/**
 * Asset Manager Permissions
 * Asset portfolio oversight and maintenance planning
 */
export const ASSET_MANAGER_PERMISSIONS = [
  // Assets (no delete)
  'assets:create',
  'assets:read',
  'assets:update',
  
  // Components (no delete)
  'components:create',
  'components:read',
  'components:update',
  
  // Maintenance (no delete, can assign)
  'maintenance:create',
  'maintenance:read',
  'maintenance:update',
  'maintenance:assign',
  'maintenance:schedule',
  
  // Users (read only)
  'users:read',
  
  // Companies (read only)
  'companies:read',
  
  // Files (no delete)
  'files:upload',
  'files:download',
  'files:manage',
  
  // Reports
  'reports:generate',
  'reports:export',
];

/**
 * Operations Supervisor Permissions
 * Read-only access with reporting capabilities
 */
export const OPERATIONS_SUPERVISOR_PERMISSIONS = [
  // Read-only access to all entities
  '*:read',
  
  // Reports
  'reports:generate',
  'reports:export',
];

/**
 * Maintenance Technician Permissions
 * Field maintenance execution and documentation
 */
export const MAINTENANCE_TECHNICIAN_PERMISSIONS = [
  // Assets (read only, assigned assets)
  'assets:read',
  
  // Components (read and update status)
  'components:read',
  'components:update',
  
  // Maintenance (create, read, update assigned)
  'maintenance:create',
  'maintenance:read',
  'maintenance:update',
  
  // Files (upload and download)
  'files:upload',
  'files:download',
  
  // Reports (read personal work)
  'reports:read',
];

// ==========================================
// Permission Helper Functions
// ==========================================

/**
 * Get permissions array for a given role
 */
export function getRolePermissions(role: string): string[] {
  const roleMap: Record<string, string[]> = {
    // System Administrators
    'super_admin': SUPER_ADMIN_PERMISSIONS,
    'support_admin': SUPPORT_ADMIN_PERMISSIONS,
    
    // Tenant Users
    'company_admin': COMPANY_ADMIN_PERMISSIONS,
    'asset_manager': ASSET_MANAGER_PERMISSIONS,
    'operations_supervisor': OPERATIONS_SUPERVISOR_PERMISSIONS,
    'maintenance_technician': MAINTENANCE_TECHNICIAN_PERMISSIONS,
  };
  
  return roleMap[role] || [];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Check for exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check for wildcard permissions
  const [entity, action] = requiredPermission.split(':');
  
  // Check for entity wildcard (e.g., "assets:*")
  if (userPermissions.includes(`${entity}:*`)) {
    return true;
  }
  
  // Check for action wildcard (e.g., "*:read")
  if (userPermissions.includes(`*:${action}`)) {
    return true;
  }
  
  // Check for global wildcard (e.g., "*:*")
  if (userPermissions.includes('*:*')) {
    return true;
  }
  
  return false;
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
}

/**
 * Generic permission evaluation for a given user context
 * Combines role-derived permissions with provided explicit permissions (if any)
 */
export function checkPermissionsForContext(
  context: { userType: string; systemRole?: string | null; permissions?: string[] },
  required: string[] | string,
  mode: 'any' | 'all' = 'any'
): boolean {
  const rolePerms = context.userType === 'system_admin' ? getRolePermissions(context.systemRole || '') : [];
  const explicitPerms = context.permissions || [];
  const userPermissions = Array.from(new Set([...rolePerms, ...explicitPerms]));
  const requiredList = Array.isArray(required) ? required : [required];
  return mode === 'all'
    ? hasAllPermissions(userPermissions, requiredList)
    : hasAnyPermission(userPermissions, requiredList);
}

/**
 * Check if user is a system administrator
 */
export function isSystemAdmin(userType: string): boolean {
  return userType === 'system_admin';
}

/**
 * Check if user is a super administrator
 */
export function isSuperAdmin(userType: string, systemRole?: string | null): boolean {
  return userType === 'system_admin' && systemRole === 'super_admin';
}

/**
 * Check if user is a support administrator
 */
export function isSupportAdmin(userType: string, systemRole?: string | null): boolean {
  return userType === 'system_admin' && systemRole === 'support_admin';
}

/**
 * Get entity-specific permissions from user's permission array
 */
export function getEntityPermissions(userPermissions: string[], entity: string): string[] {
  return userPermissions
    .filter(permission => permission.startsWith(`${entity}:`) || permission === '*:*')
    .map(permission => {
      if (permission === '*:*') return '*';
      return permission.split(':')[1];
    })
    .filter(action => action !== '*');
}

/**
 * Permission categories
 */
export const PERMISSION_CATEGORIES = {
  ASSETS: 'assets',
  COMPONENTS: 'components',
  MAINTENANCE: 'maintenance',
  USERS: 'users',
  COMPANIES: 'companies',
  FILES: 'files',
  REPORTS: 'reports',
  SYSTEM: 'system',
} as const;

/**
 * Permission actions
 */
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  IMPORT: 'import',
  EXPORT: 'export',
  ASSIGN: 'assign',
  SCHEDULE: 'schedule',
  MANAGE: 'manage',
  INVITE: 'invite',
  CONFIGURE: 'configure',
  TRANSFER: 'transfer',
  MONITOR: 'monitor',
} as const;

/**
 * Role types
 */
export const ROLE_TYPES = {
  // System Administrators
  SUPER_ADMIN: 'super_admin',
  SUPPORT_ADMIN: 'support_admin',
  
  // Tenant Users
  COMPANY_ADMIN: 'company_admin',
  ASSET_MANAGER: 'asset_manager',
  OPERATIONS_SUPERVISOR: 'operations_supervisor',
  MAINTENANCE_TECHNICIAN: 'maintenance_technician',
} as const;

/**
 * Type definitions
 */
export type Permission = string;
export type PermissionArray = Permission[];
export type Role = string;

