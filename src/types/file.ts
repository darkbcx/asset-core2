/**
 * File Types
 * 
 * Type definitions for file management and attachments
 */

export type FileEntityType = 'asset' | 'component' | 'maintenance' | 'maintenance_record';
export type StorageBackend = 'local' | 's3' | 'hybrid';
export type FileAction = 'view' | 'download' | 'delete' | 'upload';

export interface File {
  id: string;
  company_id: string;
  entity_type: FileEntityType;
  entity_id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_hash: string;
  storage_backend: StorageBackend;
  storage_path: string;
  metadata: Record<string, unknown>;
  is_public: boolean;
  uploaded_by: string;
  uploaded_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface FileInsert {
  company_id: string;
  entity_type: FileEntityType;
  entity_id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_hash: string;
  storage_backend: StorageBackend;
  storage_path: string;
  metadata?: Record<string, unknown>;
  is_public?: boolean;
  uploaded_by: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  file_hash: string;
  change_description: string | null;
  created_by: string;
  created_at: Date;
}

export interface FileVersionInsert {
  file_id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  file_hash: string;
  change_description?: string | null;
  created_by: string;
}

export interface FileAccessLog {
  id: string;
  file_id: string;
  user_id: string | null;
  action: FileAction;
  ip_address: string | null;
  user_agent: string | null;
  accessed_at: Date;
}

export interface FileAccessLogInsert {
  file_id: string;
  user_id?: string | null;
  action: FileAction;
  ip_address?: string | null;
  user_agent?: string | null;
}

