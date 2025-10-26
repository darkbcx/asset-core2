/**
 * Maintenance Types
 * 
 * Type definitions for maintenance records and related entities
 */

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export type MaintenanceStatus = 
  | 'reported'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export interface MaintenanceRecord {
  id: string;
  component_id: string;
  assigned_technician_id: string | null;
  title: string;
  description: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reported_date: Date;
  scheduled_date: Date | null;
  started_date: Date | null;
  completed_date: Date | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  labor_cost: number | null;
  parts_cost: number | null;
  total_cost: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MaintenanceRecordInsert {
  component_id: string;
  assigned_technician_id?: string | null;
  title: string;
  description?: string | null;
  priority: MaintenancePriority;
  status?: MaintenanceStatus;
  reported_date: Date;
  scheduled_date?: Date | null;
  started_date?: Date | null;
  completed_date?: Date | null;
  estimated_duration?: number | null;
  actual_duration?: number | null;
  labor_cost?: number | null;
  parts_cost?: number | null;
  total_cost?: number | null;
  notes?: string | null;
}

export interface MaintenanceRecordUpdate {
  assigned_technician_id?: string | null;
  title?: string;
  description?: string | null;
  priority?: MaintenancePriority;
  status?: MaintenanceStatus;
  scheduled_date?: Date | null;
  started_date?: Date | null;
  completed_date?: Date | null;
  estimated_duration?: number | null;
  actual_duration?: number | null;
  labor_cost?: number | null;
  parts_cost?: number | null;
  total_cost?: number | null;
  notes?: string | null;
}

export interface MaintenanceAttachment {
  id: string;
  maintenance_record_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: Date;
}

