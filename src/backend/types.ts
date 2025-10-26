/**
 * Backend Response Types
 * 
 * Standard response types for all backend functions
 */

/**
 * Standard backend function response wrapper
 * All backend functions should return this structure
 * 
 * @template T - The type of data returned on success
 * 
 * @example
 * ```typescript
 * const result: BackendResponse<User> = {
 *   success: true,
 *   result: user,
 * };
 * 
 * const error: BackendResponse<User> = {
 *   success: false,
 *   error: 'User not found',
 * };
 * ```
 */
export interface BackendResponse<T> {
  /** Whether the operation was successful */
  success: boolean;
  
  /** The result data, only present when success is true */
  result?: T;
  
  /** Error message, only present when success is false */
  error?: string;
}
