/**
 * Asset Types
 * 
 * Type definitions for assets
 */

export type AssetStatus = 
  | 'operational'
  | 'inactive'
  | 'maintenance'
  | 'retired'
  | 'disposed';

export interface Asset {
  id: string;
  company_id: string;
  asset_code: string;
  name: string;
  type: string;
  model: string | null;
  serial_number: string | null;
  status: AssetStatus;
  location_id: string | null;
  purchase_date: Date | null;
  warranty_expiry: Date | null;
  purchase_cost: number | null;
  current_value: number | null;
  specifications: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface AssetInsert {
  company_id: string;
  asset_code: string;
  name: string;
  type: string;
  model?: string | null;
  serial_number?: string | null;
  status?: AssetStatus;
  location_id?: string | null;
  purchase_date?: Date | null;
  warranty_expiry?: Date | null;
  purchase_cost?: number | null;
  current_value?: number | null;
  specifications?: Record<string, unknown>;
}

export interface AssetUpdate {
  name?: string;
  type?: string;
  model?: string | null;
  serial_number?: string | null;
  status?: AssetStatus;
  location_id?: string | null;
  purchase_date?: Date | null;
  warranty_expiry?: Date | null;
  purchase_cost?: number | null;
  current_value?: number | null;
  specifications?: Record<string, unknown>;
}

