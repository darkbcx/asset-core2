import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRolePermissions, ROLE_TYPES } from '@/lib/permissions';
import { tenantRoleSchema } from '@/lib/validators/user';

// Combine system admin roles (non-nullable) and tenant roles into a single schema
const roleSchema = z.union([
  z.enum(['super_admin', 'support_admin']), // System admin roles (extracted from systemRoleSchema without nullable)
  tenantRoleSchema, // Tenant roles
]);

/**
 * GET /api/permissions/:role
 * Returns array of permissions for a given role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
  try {
    const role = params.role;

    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      );
    }

    // Validate role
    const validationResult = roleSchema.safeParse(role);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid role',
          details: validationResult.error.issues,
          validRoles: Object.values(ROLE_TYPES),
        },
        { status: 400 }
      );
    }

    // Get permissions for the role
    const permissions = getRolePermissions(role);

    return NextResponse.json({
      success: true,
      role,
      permissions,
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

