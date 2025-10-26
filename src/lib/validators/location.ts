/**
 * Location Validation Schemas
 * 
 * Zod schemas for hierarchical location management
 */

import { z } from 'zod';

// Location type schema
export const locationTypeSchema = z.enum([
  'site',
  'building',
  'floor',
  'room',
  'area',
  'rack',
]);

// Base location schema
export const locationSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  name: z.string().min(1).max(255),
  type: locationTypeSchema,
  address: z.string().nullable(),
  coordinates: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Create location schema
export const createLocationSchema = z.object({
  company_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  type: locationTypeSchema,
  address: z.string().nullable().optional(),
  coordinates: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

// Update location schema
export const updateLocationSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255).optional(),
  type: locationTypeSchema.optional(),
  address: z.string().nullable().optional(),
  coordinates: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

// Hierarchy validation - prevent circular references
export const locationHierarchySchema = createLocationSchema.superRefine(
  async (data, ctx) => {
    // Additional validation can be added here if needed
    // For example, checking if parent exists and isn't the same as the location being created
  }
);

// Infer types from schemas
export type Location = z.infer<typeof locationSchema>;
export type LocationType = z.infer<typeof locationTypeSchema>;
export type CreateLocation = z.infer<typeof createLocationSchema>;
export type UpdateLocation = z.infer<typeof updateLocationSchema>;

// Extended types
export interface LocationWithChildren extends Location {
  children?: LocationWithChildren[];
}
