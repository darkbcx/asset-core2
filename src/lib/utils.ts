import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type User } from "@/lib/validators/user"
import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, createAuthContext } from '@/backend/authentication'
import { getRolePermissions, hasPermission, hasAllPermissions } from '@/lib/permissions'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Create a safe user response object following the User schema
 * Omits sensitive fields like password_hash for API responses
 * 
 * @param user - User object from validator schema
 * @returns User object without password_hash field
 */
export function createSafeUserResponse(user: User): Omit<User, 'password_hash'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

/**
 * Require System Administrator guard for API routes
 * Reads Bearer token, builds auth context, and ensures system_admin role.
 * Returns { ok: false, response } to early-return from route handlers.
 */
export async function requireSystemAdmin(request: NextRequest): Promise<
  | { ok: true }
  | { ok: false; response: NextResponse }
> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const ctx = await createAuthContext(token);
  if (!ctx.success || !ctx.result) {
    return { ok: false, response: NextResponse.json({ error: ctx.error || 'Unauthorized' }, { status: 401 }) };
  }

  const user = ctx.result.user;
  if (user.user_type !== 'system_admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true };
}

/**
 * Require System Administrator with permissions
 * mode: 'any' (default) or 'all'
 */
export async function requireSystemAdminWithPermissions(
  request: NextRequest,
  required: string[] | string,
  mode: 'any' | 'all' = 'any'
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const base = await requireSystemAdmin(request);
  if (!('ok' in base) || !base.ok) return base as { ok: false; response: NextResponse };

  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const ctx = await createAuthContext(token);
  if (!ctx.success || !ctx.result) {
    return { ok: false, response: NextResponse.json({ error: ctx.error || 'Unauthorized' }, { status: 401 }) };
  }

  // Build permissions from system role (system admins only)
  const systemRole = ctx.result.user.system_role || '';
  const userPermissions = getRolePermissions(systemRole);

  const requiredList = Array.isArray(required) ? required : [required];
  const allowed = mode === 'all'
    ? hasAllPermissions(userPermissions, requiredList)
    : requiredList.some((p) => hasPermission(userPermissions, p));

  if (!allowed) {
    return { ok: false, response: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }) };
  }

  return { ok: true };
}
