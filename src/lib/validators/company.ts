/**
 * Company Validation Schemas
 * 
 * Zod schemas for company/organization validation
 */

import { z } from 'zod';

// Subscription plan schema
export const subscriptionPlanSchema = z.enum(['basic', 'professional', 'enterprise', 'custom']);

// Company settings schema
export const companySettingsSchema = z.object({
  asset_types: z.array(z.string()).optional(),
  maintenance_intervals: z.record(z.string(), z.number()).optional(),
  notification_settings: z.record(z.string(), z.boolean()).optional(),
  custom_fields: z.record(z.string(), z.unknown()).optional(),
});

// Base company schema
export const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  domain: z.string().nullable(),
  settings: z.record(z.string(), z.unknown()),
  subscription_plan: subscriptionPlanSchema,
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Create company schema
export const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  domain: z.string().url().nullable().optional().or(z.literal('')),
  settings: companySettingsSchema.optional(),
  subscription_plan: subscriptionPlanSchema.optional(),
  is_active: z.boolean().optional(),
});

// Update company schema
export const updateCompanySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  domain: z.string().url().nullable().optional().or(z.literal('')),
  settings: companySettingsSchema.optional(),
  subscription_plan: subscriptionPlanSchema.optional(),
  is_active: z.boolean().optional(),
});

// Infer types from schemas
export type Company = z.infer<typeof companySchema>;
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type CompanySettings = z.infer<typeof companySettingsSchema>;
export type CreateCompany = z.infer<typeof createCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;

