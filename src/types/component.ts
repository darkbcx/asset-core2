/**
 * Component Types
 * 
 * Type definitions for components and related entities
 */

export type ComponentStatus = 
  | 'installed'
  | 'removed'
  | 'repairing'
  | 'in_stock'
  | 'ordered'
  | 'disposed';

export interface Component {
  id: string;
  asset_id: string;
  component_code: string;
  name: string;
  type: string;
  serial_number: string | null;
  part_number: string | null;
  manufacturer: string | null;
  position: string | null;
  status: ComponentStatus;
  installation_date: Date | null;
  warranty_expiry: Date | null;
  purchase_cost: number | null;
  specifications: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface ComponentInsert {
  asset_id: string;
  component_code: string;
  name: string;
  type: string;
  serial_number?: string | null;
  part_number?: string | null;
  manufacturer?: string | null;
  position?: string | null;
  status?: ComponentStatus;
  installation_date?: Date | null;
  warranty_expiry?: Date | null;
  purchase_cost?: number | null;
  specifications?: Record<string, unknown>;
}

export interface ComponentUpdate {
  name?: string;
  type?: string;
  serial_number?: string | null;
  part_number?: string | null;
  manufacturer?: string | null;
  position?: string | null;
  status?: ComponentStatus;
  installation_date?: Date | null;
  warranty_expiry?: Date | null;
  purchase_cost?: number | null;
  specifications?: Record<string, unknown>;
}

export interface ComponentTransfer {
  id: string;
  component_id: string;
  from_asset_id: string;
  to_asset_id: string;
  transfer_date: Date;
  reason: string | null;
  performed_by: string;
  notes: string | null;
}

export interface ComponentTransferInsert {
  component_id: string;
  from_asset_id: string;
  to_asset_id: string;
  transfer_date: Date;
  reason?: string | null;
  performed_by: string;
  notes?: string | null;
}

