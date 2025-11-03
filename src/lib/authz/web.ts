import { checkPermissionsForContext } from '@/lib/permissions';

export interface WebUserContext {
  userType: string;
  systemRole?: string | null;
  permissions?: string[]; // tenant-specific, if any
}

export function hasUserPermissions(
  user: WebUserContext,
  required: string[] | string,
  mode: 'any' | 'all' = 'any'
): boolean {
  return checkPermissionsForContext(user, required, mode);
}


