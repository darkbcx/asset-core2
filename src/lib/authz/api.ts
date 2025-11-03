import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, createAuthContext } from '@/backend/authentication';
import { checkPermissionsForContext } from '@/lib/permissions';

export async function requireSystemAdmin(request: NextRequest): Promise<
  | { ok: true; context: { userId: string } }
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

  return { ok: true, context: { userId: user.id } };
}

export async function requireSystemAdminWithPermissions(
  request: NextRequest,
  required: string[] | string,
  mode: 'any' | 'all' = 'any'
): Promise<
  | { ok: true; context: { userId: string } }
  | { ok: false; response: NextResponse }
> {
  const base = await requireSystemAdmin(request);
  if (!base.ok) return base;

  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const ctx = await createAuthContext(token);
  if (!ctx.success || !ctx.result) {
    return { ok: false, response: NextResponse.json({ error: ctx.error || 'Unauthorized' }, { status: 401 }) };
  }

  const allowed = checkPermissionsForContext(
    {
      userType: ctx.result.user.user_type,
      systemRole: ctx.result.user.system_role,
      permissions: [], // system admin permissions are derived from role
    },
    required,
    mode
  );

  if (!allowed) {
    return { ok: false, response: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }) };
  }

  return { ok: true, context: { userId: ctx.result.user.id } };
}


