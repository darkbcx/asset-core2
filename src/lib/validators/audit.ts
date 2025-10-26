/**
 * Audit Validation Schemas
 * 
 * Zod schemas for audit logging and compliance
 */

import { z } from 'zod';

// Base audit log schema
export const auditLogSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  action: z.string().min(1).max(100),
  entity_type: z.string().min(1).max(100),
  entity_id: z.string().uuid(),
  old_values: z.record(z.string(), z.unknown()).nullable(),
  new_values: z.record(z.string(), z.unknown()).nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.date(),
});

// Create audit log schema
export const createAuditLogSchema = z.object({
  company_id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  action: z.string().min(1).max(100),
  entity_type: z.string().min(1).max(100),
  entity_id: z.string().uuid(),
  old_values: z.record(z.string(), z.unknown()).nullable().optional(),
  new_values: z.record(z.string(), z.unknown()).nullable().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});

// Common audit actions
export const auditActionSchema = z.enum([
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'permission_change',
  'export',
  'import',
  'upload',
  'download',
]);

// Infer types from schemas
export type AuditLog = z.infer<typeof auditLogSchema>;
export type CreateAuditLog = z.infer<typeof createAuditLogSchema>;
export type AuditAction = z.infer<typeof auditActionSchema>;

