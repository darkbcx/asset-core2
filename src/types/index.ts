/**
 * Central export for all types
 */

// User types
export * from './user';
export * from './company';

// Core asset management types
export * from './asset';
export * from './component';
export * from './maintenance';
export * from './location';

// File management types
export * from './file';

// System types
export * from './audit';

// Common utility types
export type Timestamps = {
  created_at: Date;
  updated_at: Date;
};

export type SoftDelete = {
  deleted_at: Date | null;
};

export type Pagination = {
  offset: number;
  limit: number;
};

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    has_more: boolean;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
  code?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

