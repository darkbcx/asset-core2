/**
 * File Validation Schemas
 * 
 * Zod schemas for file management and attachments
 */

import { z } from 'zod';

// File entity type schema
export const fileEntityTypeSchema = z.enum(['asset', 'component', 'maintenance', 'maintenance_record']);

// Storage backend schema
export const storageBackendSchema = z.enum(['local', 's3', 'hybrid']);

// File action schema
export const fileActionSchema = z.enum(['view', 'download', 'delete', 'upload']);

// Base file schema
export const fileSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  entity_type: fileEntityTypeSchema,
  entity_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  original_name: z.string().min(1).max(255),
  file_path: z.string().min(1).max(500),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1).max(100),
  file_hash: z.string().length(64), // SHA-256 hash
  storage_backend: storageBackendSchema,
  storage_path: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.unknown()),
  is_public: z.boolean(),
  uploaded_by: z.string().uuid(),
  uploaded_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

// Create file schema
export const createFileSchema = z.object({
  company_id: z.string().uuid(),
  entity_type: fileEntityTypeSchema,
  entity_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  original_name: z.string().min(1).max(255),
  file_path: z.string().min(1).max(500),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1).max(100),
  file_hash: z.string().length(64),
  storage_backend: storageBackendSchema,
  storage_path: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.unknown()).optional(),
  is_public: z.boolean().optional(),
  uploaded_by: z.string().uuid(),
});

// File version schema
export const fileVersionSchema = z.object({
  id: z.string().uuid(),
  file_id: z.string().uuid(),
  version_number: z.number().int().positive(),
  file_path: z.string().min(1).max(500),
  file_size: z.number().int().positive(),
  file_hash: z.string().length(64),
  change_description: z.string().nullable(),
  created_by: z.string().uuid(),
  created_at: z.date(),
});

export const createFileVersionSchema = z.object({
  file_id: z.string().uuid(),
  version_number: z.number().int().positive(),
  file_path: z.string().min(1).max(500),
  file_size: z.number().int().positive(),
  file_hash: z.string().length(64),
  change_description: z.string().nullable().optional(),
  created_by: z.string().uuid(),
});

// File access log schema
export const fileAccessLogSchema = z.object({
  id: z.string().uuid(),
  file_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  action: fileActionSchema,
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  accessed_at: z.date(),
});

export const createFileAccessLogSchema = z.object({
  file_id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  action: fileActionSchema,
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});

// File upload schema (for API requests)
export const fileUploadSchema = z.object({
  entity_type: fileEntityTypeSchema,
  entity_id: z.string().uuid(),
  file: z.instanceof(File).refine(
    (file) => file.size <= 100 * 1024 * 1024, // 100MB max
    "File size must be less than 100MB"
  ),
  metadata: z.record(z.string(), z.unknown()).optional(),
  is_public: z.boolean().optional(),
});

// Infer types from schemas
export type File = z.infer<typeof fileSchema>;
export type FileEntityType = z.infer<typeof fileEntityTypeSchema>;
export type StorageBackend = z.infer<typeof storageBackendSchema>;
export type FileAction = z.infer<typeof fileActionSchema>;
export type CreateFile = z.infer<typeof createFileSchema>;
export type FileVersion = z.infer<typeof fileVersionSchema>;
export type CreateFileVersion = z.infer<typeof createFileVersionSchema>;
export type FileAccessLog = z.infer<typeof fileAccessLogSchema>;
export type CreateFileAccessLog = z.infer<typeof createFileAccessLogSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;

