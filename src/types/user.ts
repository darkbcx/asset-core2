/**
 * User Types
 * 
 * Type definitions for users, user companies, and related entities
 */

export type UserType = 'tenant' | 'system_admin';

export type SystemRole = 'super_admin' | 'support_admin' | null;

export type TenantRole = 
  | 'company_admin'
  | 'asset_manager'
  | 'operations_supervisor'
  | 'maintenance_technician';

export interface User {
  id: string;
  user_type: UserType;
  system_role: SystemRole;
  email: string;
  first_name: string;
  last_name?: string;
  is_active: boolean;
  last_login: Date | null;
  password_hash: string;
  system_permissions: PermissionSet | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  permissions: PermissionSet;
  is_active: boolean;
  is_primary: boolean;
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionSet {
  [entity: string]: {
    [action: string]: boolean;
  };
}

export interface UserWithCompanies extends User {
  companies?: UserCompany[];
}

/**
 * Type guards
 */
export function isSystemAdmin(user: User): boolean {
  return user.user_type === 'system_admin';
}

export function isTenantUser(user: User): boolean {
  return user.user_type === 'tenant';
}

export function isSuperAdmin(user: User): boolean {
  return user.user_type === 'system_admin' && user.system_role === 'super_admin';
}

export function isSupportAdmin(user: User): boolean {
  return user.user_type === 'system_admin' && user.system_role === 'support_admin';
}

