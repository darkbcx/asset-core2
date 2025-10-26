/**
 * Central export for all validators
 * 
 * This file re-exports all Zod schemas and types from individual validator modules
 */

// User validators
export * from './user';

// Company validators
export * from './company';

// Asset management validators
export * from './asset';
export * from './component';
export * from './maintenance';
export * from './location';

// File management validators
export * from './file';

// System validators
export * from './audit';

// Common query schemas
import { z } from 'zod';

export const paginationSchema = z.object({
  offset: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().max(100).default(20),
});

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

export const dateRangeSchema = z.object({
  start_date: z.date().optional(),
  end_date: z.date().optional(),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return data.start_date <= data.end_date;
    }
    return true;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["end_date"],
  }
);

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(255).optional(),
});

export const filterSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  date_from: z.date().optional(),
  date_to: z.date().optional(),
});

export type Pagination = z.infer<typeof paginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type Filter = z.infer<typeof filterSchema>;

// Common utility types
export type Timestamps = {
  created_at: Date;
  updated_at: Date;
};

export type SoftDelete = {
  deleted_at: Date | null;
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

