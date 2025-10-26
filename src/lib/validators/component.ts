/**
 * Component Validation Schemas
 * 
 * Zod schemas for component and transfer validation
 */

import { z } from 'zod';

// Component status schema
export const componentStatusSchema = z.enum([
  'installed',
  'removed',
  'repairing',
  'in_stock',
  'ordered',
  'disposed',
]);

// Base component schema
export const componentSchema = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid(),
  component_code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  serial_number: z.string().max(255).nullable(),
  part_number: z.string().max(255).nullable(),
  manufacturer: z.string().max(255).nullable(),
  position: z.string().max(100).nullable(),
  status: componentStatusSchema,
  installation_date: z.date().nullable(),
  warranty_expiry: z.date().nullable(),
  purchase_cost: z.number().positive().nullable(),
  specifications: z.record(z.string(), z.unknown()),
  created_at: z.date(),
  updated_at: z.date(),
});

// Create component schema
export const createComponentSchema = z.object({
  asset_id: z.string().uuid(),
  component_code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  serial_number: z.string().max(255).nullable().optional(),
  part_number: z.string().max(255).nullable().optional(),
  manufacturer: z.string().max(255).nullable().optional(),
  position: z.string().max(100).nullable().optional(),
  status: componentStatusSchema.optional(),
  installation_date: z.date().nullable().optional(),
  warranty_expiry: z.date().nullable().optional(),
  purchase_cost: z.number().positive().nullable().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
});

// Update component schema
export const updateComponentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.string().min(1).max(100).optional(),
  serial_number: z.string().max(255).nullable().optional(),
  part_number: z.string().max(255).nullable().optional(),
  manufacturer: z.string().max(255).nullable().optional(),
  position: z.string().max(100).nullable().optional(),
  status: componentStatusSchema.optional(),
  installation_date: z.date().nullable().optional(),
  warranty_expiry: z.date().nullable().optional(),
  purchase_cost: z.number().positive().nullable().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
});

// Component transfer schemas
export const componentTransferSchema = z.object({
  id: z.string().uuid(),
  component_id: z.string().uuid(),
  from_asset_id: z.string().uuid(),
  to_asset_id: z.string().uuid(),
  transfer_date: z.date(),
  reason: z.string().nullable(),
  performed_by: z.string().uuid(),
  notes: z.string().nullable(),
});

export const createComponentTransferSchema = z.object({
  component_id: z.string().uuid(),
  from_asset_id: z.string().uuid(),
  to_asset_id: z.string().uuid(),
  transfer_date: z.date(),
  reason: z.string().nullable().optional(),
  performed_by: z.string().uuid(),
  notes: z.string().nullable().optional(),
}).refine(
  (data) => data.from_asset_id !== data.to_asset_id,
  {
    message: "Source and destination assets must be different",
    path: ["to_asset_id"],
  }
);

// Infer types from schemas
export type Component = z.infer<typeof componentSchema>;
export type ComponentStatus = z.infer<typeof componentStatusSchema>;
export type CreateComponent = z.infer<typeof createComponentSchema>;
export type UpdateComponent = z.infer<typeof updateComponentSchema>;
export type ComponentTransfer = z.infer<typeof componentTransferSchema>;
export type CreateComponentTransfer = z.infer<typeof createComponentTransferSchema>;
