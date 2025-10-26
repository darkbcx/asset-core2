/**
 * Maintenance Validation Schemas
 * 
 * Zod schemas for maintenance records and attachments
 */

import { z } from 'zod';

// Maintenance priority schema
export const maintenancePrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

// Maintenance status schema
export const maintenanceStatusSchema = z.enum([
  'reported',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold',
]);

// Base maintenance record schema
export const maintenanceRecordSchema = z.object({
  id: z.string().uuid(),
  component_id: z.string().uuid(),
  assigned_technician_id: z.string().uuid().nullable(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  priority: maintenancePrioritySchema,
  status: maintenanceStatusSchema,
  reported_date: z.date(),
  scheduled_date: z.date().nullable(),
  started_date: z.date().nullable(),
  completed_date: z.date().nullable(),
  estimated_duration: z.number().int().positive().nullable(),
  actual_duration: z.number().int().positive().nullable(),
  labor_cost: z.number().positive().nullable(),
  parts_cost: z.number().positive().nullable(),
  total_cost: z.number().positive().nullable(),
  notes: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Create maintenance record schema
export const createMaintenanceRecordSchema = z.object({
  component_id: z.string().uuid(),
  assigned_technician_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  priority: maintenancePrioritySchema,
  status: maintenanceStatusSchema.optional(),
  reported_date: z.date().default(() => new Date()),
  scheduled_date: z.date().nullable().optional(),
  started_date: z.date().nullable().optional(),
  completed_date: z.date().nullable().optional(),
  estimated_duration: z.number().int().positive().nullable().optional(),
  actual_duration: z.number().int().positive().nullable().optional(),
  labor_cost: z.number().positive().nullable().optional(),
  parts_cost: z.number().positive().nullable().optional(),
  total_cost: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Update maintenance record schema
export const updateMaintenanceRecordSchema = z.object({
  assigned_technician_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  priority: maintenancePrioritySchema.optional(),
  status: maintenanceStatusSchema.optional(),
  scheduled_date: z.date().nullable().optional(),
  started_date: z.date().nullable().optional(),
  completed_date: z.date().nullable().optional(),
  estimated_duration: z.number().int().positive().nullable().optional(),
  actual_duration: z.number().int().positive().nullable().optional(),
  labor_cost: z.number().positive().nullable().optional(),
  parts_cost: z.number().positive().nullable().optional(),
  total_cost: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Maintenance attachment schema
export const maintenanceAttachmentSchema = z.object({
  id: z.string().uuid(),
  maintenance_record_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  file_path: z.string().min(1).max(500),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1).max(100),
  uploaded_by: z.string().uuid(),
  uploaded_at: z.date(),
});

export const createMaintenanceAttachmentSchema = z.object({
  maintenance_record_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  file_path: z.string().min(1).max(500),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1).max(100),
  uploaded_by: z.string().uuid(),
});

// Infer types from schemas
export type MaintenanceRecord = z.infer<typeof maintenanceRecordSchema>;
export type MaintenancePriority = z.infer<typeof maintenancePrioritySchema>;
export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>;
export type CreateMaintenanceRecord = z.infer<typeof createMaintenanceRecordSchema>;
export type UpdateMaintenanceRecord = z.infer<typeof updateMaintenanceRecordSchema>;
export type MaintenanceAttachment = z.infer<typeof maintenanceAttachmentSchema>;
export type CreateMaintenanceAttachment = z.infer<typeof createMaintenanceAttachmentSchema>;

