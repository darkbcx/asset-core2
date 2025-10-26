/**
 * User Validation Schemas
 * 
 * Zod schemas for user-related validation
 */

import { z } from 'zod';

// User type definitions
export const userTypeSchema = z.enum(['tenant', 'system_admin']);
export const systemRoleSchema = z.enum(['super_admin', 'support_admin']).nullable();
export const tenantRoleSchema = z.enum([
  'company_admin',
  'asset_manager',
  'operations_supervisor',
  'maintenance_technician',
]);

// Permission set schema
export const permissionSetSchema = z.record(
  z.string(),
  z.record(z.string(), z.boolean())
);

// Base user schema
export const userSchema = z.object({
  id: z.string().uuid(),
  user_type: z.enum(['tenant', 'system_admin']),
  system_role: z.enum(['super_admin', 'support_admin']).nullable(),
  email: z.string().email(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100).optional(),
  is_active: z.boolean(),
  last_login: z.date().nullable(),
  password_hash: z.string().min(1),
  system_permissions: permissionSetSchema.nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

// UserCompany schema
export const userCompanySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  company_id: z.string().uuid(),
  role: z.string().min(1).max(50),
  permissions: permissionSetSchema,
  is_active: z.boolean(),
  is_primary: z.boolean(),
  joined_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Create user schema (for registration/signup)
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100).optional(),
  user_type: userTypeSchema,
  system_role: systemRoleSchema.optional(),
  system_permissions: permissionSetSchema.optional(),
});

// Update user schema
export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  is_active: z.boolean().optional(),
  system_role: systemRoleSchema.optional(),
  system_permissions: permissionSetSchema.optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// UserCompany insert/update schemas
export const createUserCompanySchema = z.object({
  user_id: z.string().uuid(),
  company_id: z.string().uuid(),
  role: tenantRoleSchema,
  permissions: permissionSetSchema.optional(),
  is_active: z.boolean().optional(),
  is_primary: z.boolean().optional(),
});

export const updateUserCompanySchema = z.object({
  role: tenantRoleSchema.optional(),
  permissions: permissionSetSchema.optional(),
  is_active: z.boolean().optional(),
  is_primary: z.boolean().optional(),
});

// Infer types from schemas
export type User = z.infer<typeof userSchema>;
export type UserType = z.infer<typeof userTypeSchema>;
export type SystemRole = z.infer<typeof systemRoleSchema>;
export type TenantRole = z.infer<typeof tenantRoleSchema>;
export type PermissionSet = z.infer<typeof permissionSetSchema>;
export type UserCompany = z.infer<typeof userCompanySchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Login = z.infer<typeof loginSchema>;
export type CreateUserCompany = z.infer<typeof createUserCompanySchema>;
export type UpdateUserCompany = z.infer<typeof updateUserCompanySchema>;

