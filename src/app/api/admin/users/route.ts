import { NextRequest, NextResponse } from "next/server";
import { listUsersPaginated } from "@/backend/user";
import { register } from "@/backend/authentication";
import { createUserSchema, type User } from "@/lib/validators/user";
import { createSafeUserResponse } from "@/lib/utils";
import { requireSystemAdminWithPermissions } from "@/lib/authz/api";

// GET /api/admin/users → list users with pagination (system-wide)
export async function GET(request: NextRequest) {
  const auth = await requireSystemAdminWithPermissions(request, ["users:read", "*:read"], 'any');
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");
    const userType = searchParams.get("userType") as
      | "tenant"
      | "system_admin"
      | null;
    const isActiveParam = searchParams.get("isActive");

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const isActive =
      isActiveParam !== null ? isActiveParam === "true" : undefined;

    const result = await listUsersPaginated({
      limit,
      cursor,
      userType: userType ?? undefined,
      isActive,
    });

    if (!result.success || !result.result) {
      return NextResponse.json(
        { error: result.error || "Failed to list users" },
        { status: 500 }
      );
    }

    const safeUsers = result.result.users.map((u: User) =>
      createSafeUserResponse(u)
    );
    return NextResponse.json({
      data: safeUsers,
      pagination: result.result.pagination,
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

// POST /api/admin/users → create user (system-wide)
export async function POST(request: NextRequest) {
  const auth = await requireSystemAdminWithPermissions(request, ["users:create", "users:manage"], 'any');
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);

    // Use authentication.register to handle hashing & creation
    const user = await register(validated);

    return NextResponse.json(
      {
        success: true,
        user: createSafeUserResponse(user as unknown as User),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 400 }
    );
  }
}
