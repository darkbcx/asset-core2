/**
 * Location Types
 * 
 * Type definitions for hierarchical location management
 */

export type LocationType = 
  | 'site'
  | 'building'
  | 'floor'
  | 'room'
  | 'area'
  | 'rack';

export interface Location {
  id: string;
  company_id: string;
  parent_id: string | null;
  name: string;
  type: LocationType;
  address: string | null;
  coordinates: string | null; // POINT type stored as string
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LocationInsert {
  company_id: string;
  parent_id?: string | null;
  name: string;
  type: LocationType;
  address?: string | null;
  coordinates?: string | null;
  is_active?: boolean;
}

export interface LocationUpdate {
  parent_id?: string | null;
  name?: string;
  type?: LocationType;
  address?: string | null;
  coordinates?: string | null;
  is_active?: boolean;
}

export interface LocationWithChildren extends Location {
  children?: LocationWithChildren[];
}

