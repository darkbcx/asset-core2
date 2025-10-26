/**
 * Asset Validation Schemas
 * 
 * Zod schemas for asset validation
 */

import { z } from 'zod';

// Asset status schema
export const assetStatusSchema = z.enum([
  'operational',
  'inactive',
  'maintenance',
  'retired',
  'disposed',
]);

// Base asset schema
export const assetSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  asset_code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  model: z.string().max(255).nullable(),
  serial_number: z.string().max(255).nullable(),
  status: assetStatusSchema,
  location_id: z.string().uuid().nullable(),
  purchase_date: z.date().nullable(),
  warranty_expiry: z.date().nullable(),
  purchase_cost: z.number().positive().nullable(),
  current_value: z.number().positive().nullable(),
  specifications: z.record(z.string(), z.unknown()),
  created_at: z.date(),
  updated_at: z.date(),
});

// Create asset schema
export const createAssetSchema = z.object({
  company_id: z.string().uuid(),
  asset_code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  model: z.string().max(255).nullable().optional(),
  serial_number: z.string().max(255).nullable().optional(),
  status: assetStatusSchema.optional(),
  location_id: z.string().uuid().nullable().optional(),
  purchase_date: z.date().nullable().optional(),
  warranty_expiry: z.date().nullable().optional(),
  purchase_cost: z.number().positive().nullable().optional(),
  current_value: z.number().positive().nullable().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
});

// Update asset schema
export const updateAssetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.string().min(1).max(100).optional(),
  model: z.string().max(255).nullable().optional(),
  serial_number: z.string().max(255).nullable().optional(),
  status: assetStatusSchema.optional(),
  location_id: z.string().uuid().nullable().optional(),
  purchase_date: z.date().nullable().optional(),
  warranty_expiry: z.date().nullable().optional(),
  purchase_cost: z.number().positive().nullable().optional(),
  current_value: z.number().positive().nullable().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
});

// Infer types from schemas
export type Asset = z.infer<typeof assetSchema>;
export type AssetStatus = z.infer<typeof assetStatusSchema>;
export type CreateAsset = z.infer<typeof createAssetSchema>;
export type UpdateAsset = z.infer<typeof updateAssetSchema>;

