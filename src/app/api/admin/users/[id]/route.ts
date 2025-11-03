import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/backend/user";
import { updateUserSchema, type User } from "@/lib/validators/user";
import { createSafeUserResponse, requireSystemAdminWithPermissions } from "@/lib/utils";

// requireSystemAdmin is imported from utils

// GET /api/admin/users/:id
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = await requireSystemAdminWithPermissions(request, ["users:read", "*:read"], 'any');
  if (!auth.ok) return auth.response;

  try {
    const { id } = context.params;
    const result = await getUserById(id);
    if (!result.success || !result.result) {
      return NextResponse.json(
        { error: result.error || "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      user: createSafeUserResponse(result.result as unknown as User),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/:id
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = await requireSystemAdminWithPermissions(request, ["users:update", "users:manage"], 'any');
  if (!auth.ok) return auth.response;

  try {
    const { id } = context.params;
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    const result = await updateUser(id, validated);
    if (!result.success || !result.result) {
      return NextResponse.json(
        { error: result.error || "Failed to update user" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: createSafeUserResponse(result.result as unknown as User),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 400 }
    );
  }
}

// DELETE /api/admin/users/:id
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = await requireSystemAdminWithPermissions(request, ["users:delete", "users:manage"], 'any');
  if (!auth.ok) return auth.response;

  try {
    const { id } = context.params;
    const ok = await deleteUser(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
