/**
 * Company Types
 * 
 * Type definitions for companies/organizations
 */

export type SubscriptionPlan = 'basic' | 'professional' | 'enterprise' | 'custom';

export interface Company {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  settings: Record<string, unknown>;
  subscription_plan: SubscriptionPlan;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CompanySettings {
  asset_types?: string[];
  maintenance_intervals?: Record<string, number>;
  notification_settings?: Record<string, boolean>;
  custom_fields?: Record<string, unknown>;
}

