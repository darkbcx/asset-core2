/**
 * User Repository
 *
 * Backend business logic for user management operations.
 * Handles CRUD operations for users, user-company associations, and queries.
 *
 * Security:
 * - All queries use parameterized statements for SQL injection prevention
 * - Multi-tenant data isolation enforcement
 * - User type validation (tenant vs system_admin)
 */

import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import {
  updateUserSchema,
  createUserCompanySchema,
  updateUserCompanySchema,
} from "@/lib/validators/user";
import type {
  User,
  UserCompany,
  UserWithCompanies,
  CreateUser,
  UpdateUser,
  CreateUserCompany,
  UpdateUserCompany,
} from "@/lib/validators/user";
import type { BackendResponse } from "@/backend/types";

/**
 * Check if user is a system administrator
 */
export function isSystemAdmin(user: User | string): boolean {
  const userType = typeof user === "string" ? user : user.user_type;
  return userType === "system_admin";
}

/**
 * Check if user is a tenant user
 */
export function isTenantUser(user: User | string): boolean {
  const userType = typeof user === "string" ? user : user.user_type;
  return userType === "tenant";
}

/**
 * Check if user is a super administrator
 */
export function isSuperAdmin(user: User): boolean {
  return (
    user.user_type === "system_admin" && user.system_role === "super_admin"
  );
}

/**
 * Check if user is a support administrator
 */
export function isSupportAdmin(user: User): boolean {
  return (
    user.user_type === "system_admin" && user.system_role === "support_admin"
  );
}

/**
 * Create a new user
 *
 * @param userData - User creation data
 * @param passwordHash - Pre-hashed password (use authentication module for hashing)
 * @returns Created user
 * @throws Error if email already exists or validation fails
 */
export async function createUser(
  userData: CreateUser,
  passwordHash: string
): Promise<User> {
  const userId = uuidv4();
  const now = new Date();

  const user: User = {
    id: userId,
    user_type: userData.user_type,
    system_role: userData.system_role || null,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name || undefined,
    is_active: true,
    last_login: null,
    password_hash: passwordHash,
    system_permissions: userData.system_permissions || null,
    created_at: now,
    updated_at: now,
  };

  const query = `
    INSERT INTO users (
      id, user_type, system_role, system_permissions, email,
      first_name, last_name, is_active, last_login, password_hash,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    user.id,
    user.user_type,
    user.system_role,
    user.system_permissions ? JSON.stringify(user.system_permissions) : null,
    user.email,
    user.first_name,
    user.last_name || null,
    user.is_active,
    user.last_login,
    user.password_hash,
    user.created_at,
    user.updated_at,
  ];

  await db.execute(query, params);

  return user;
}

/**
 * Get user by ID
 *
 * @param userId - User ID
 * @returns User or null if not found
 */
export async function getUserById(
  userId: string
): Promise<BackendResponse<User>> {
  try {
    const query = `
      SELECT * FROM users WHERE id = ?
    `;

    const user = await db.queryOne<User>(query, [userId]);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      result: user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

/**
 * Get user by email
 *
 * @param email - User email
 * @returns User or null if not found
 */
export async function getUserByEmail(
  email: string
): Promise<BackendResponse<User>> {
  try {
    const query = `
      SELECT * FROM users WHERE email = ?
    `;

    const user = await db.queryOne<User>(query, [email]);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      result: user,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get user by email",
    };
  }
}

/**
 * Get user by ID with company associations
 *
 * @param userId - User ID
 * @returns User with companies or null if not found
 */
export async function getUserWithCompanies(
  userId: string
): Promise<BackendResponse<UserWithCompanies>> {
  try {
    const userResult = await getUserById(userId);

    if (!userResult.success || !userResult.result) {
      return {
        success: false,
        error: userResult.error || "User not found",
      };
    }

    const companies = await getUserCompaniesByUserId(userId);

    return {
      success: true,
      result: {
        ...userResult.result,
        companies,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get user with companies",
    };
  }
}

/**
 * Update user
 *
 * @param userId - User ID
 * @param userData - User update data
 * @returns Updated user
 */
export async function updateUser(
  userId: string,
  userData: UpdateUser
): Promise<BackendResponse<User>> {
  try {
    // Validate input
    const validatedData = updateUserSchema.parse(userData);

    // Check if user exists
    const existingUserResult = await getUserById(userId);

    if (!existingUserResult.success) {
      return {
        success: false,
        error: existingUserResult.error || "User not found",
      };
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const params: unknown[] = [];

    if (validatedData.first_name !== undefined) {
      updates.push("first_name = ?");
      params.push(validatedData.first_name);
    }

    if (validatedData.last_name !== undefined) {
      updates.push("last_name = ?");
      params.push(validatedData.last_name);
    }

    if (validatedData.email !== undefined) {
      // Check if email is already taken by another user
      const userWithEmailResult = await getUserByEmail(validatedData.email);
      if (
        userWithEmailResult.success &&
        userWithEmailResult.result &&
        userWithEmailResult.result.id !== userId
      ) {
        return {
          success: false,
          error: "Email already registered",
        };
      }
      updates.push("email = ?");
      params.push(validatedData.email);
    }

    if (validatedData.is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(validatedData.is_active);
    }

    if (validatedData.system_role !== undefined) {
      updates.push("system_role = ?");
      params.push(validatedData.system_role);
    }

    if (validatedData.system_permissions !== undefined) {
      updates.push("system_permissions = ?");
      params.push(
        validatedData.system_permissions
          ? JSON.stringify(validatedData.system_permissions)
          : null
      );
    }

    // Always update updated_at
    updates.push("updated_at = ?");
    params.push(new Date());

    // Add userId to params for WHERE clause
    params.push(userId);

    const query = `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = ?
  `;

    await db.execute(query, params);

    // Fetch and return updated user
    const updatedUserResult = await getUserById(userId);

    if (!updatedUserResult.success) {
      return {
        success: false,
        error: updatedUserResult.error || "Failed to retrieve updated user",
      };
    }

    return {
      success: true,
      result: updatedUserResult.result!,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Delete user (soft delete by setting is_active = false)
 *
 * @param userId - User ID
 * @returns True if successful
 * @throws Error if user not found
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const query = `
    UPDATE users
    SET is_active = false, updated_at = ?
    WHERE id = ?
  `;

  await db.execute(query, [new Date(), userId]);

  return true;
}

/**
 * Get users by company
 *
 * @param companyId - Company ID
 * @param includeInactive - Include inactive users (default: false)
 * @returns Array of users associated with the company
 */
export async function getUsersByCompany(
  companyId: string,
  includeInactive = false
): Promise<User[]> {
  const query = `
    SELECT u.*
    FROM users u
    INNER JOIN user_companies uc ON u.id = uc.user_id
    WHERE uc.company_id = ? AND uc.is_active = true
    ${includeInactive ? "" : "AND u.is_active = true"}
    ORDER BY u.first_name, u.last_name
  `;

  const [rows] = await db.execute<User>(query, [companyId]);
  return rows;
}

/**
 * Get all users (for system administrators)
 *
 * @param filters - Optional filters
 * @returns Array of users
 */
export async function getAllUsers(filters?: {
  userType?: "tenant" | "system_admin";
  isActive?: boolean;
}): Promise<User[]> {
  let query = "SELECT * FROM users WHERE 1=1";
  const params: unknown[] = [];

  if (filters?.userType) {
    query += " AND user_type = ?";
    params.push(filters.userType);
  }

  if (filters?.isActive !== undefined) {
    query += " AND is_active = ?";
    params.push(filters.isActive);
  }

  query += " ORDER BY created_at DESC";

  const [rows] = await db.execute<User>(query, params);
  return rows;
}

/**
 * Get active users count by company
 *
 * @param companyId - Company ID
 * @returns Number of active users in the company
 */
export async function getActiveUsersCountByCompany(
  companyId: string
): Promise<number> {
  const query = `
    SELECT COUNT(*) as count
    FROM users u
    INNER JOIN user_companies uc ON u.id = uc.user_id
    WHERE uc.company_id = ? AND uc.is_active = true AND u.is_active = true
  `;

  const [rows] = await db.execute<{ count: number }>(query, [companyId]);
  return rows[0]?.count || 0;
}

/**
 * Check if email exists
 *
 * @param email - Email to check
 * @param excludeUserId - Optional user ID to exclude from check
 * @returns True if email exists
 */
export async function emailExists(
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  let query = "SELECT id FROM users WHERE email = ?";
  const params: unknown[] = [email];

  if (excludeUserId) {
    query += " AND id != ?";
    params.push(excludeUserId);
  }

  const user = await db.queryOne<User>(query, params);
  return user !== null;
}

// ==========================================
// UserCompany Operations
// ==========================================

/**
 * Create user-company association
 *
 * @param userCompanyData - User company creation data
 * @returns Created user-company association
 * @throws Error if association already exists or validation fails
 */
export async function createUserCompany(
  userCompanyData: CreateUserCompany
): Promise<UserCompany> {
  // Validate input
  const validatedData = createUserCompanySchema.parse(userCompanyData);

  const id = uuidv4();
  const now = new Date();

  const userCompany: UserCompany = {
    id,
    user_id: validatedData.user_id,
    company_id: validatedData.company_id,
    role: validatedData.role,
    permissions: validatedData.permissions || {},
    is_active: validatedData.is_active ?? true,
    is_primary: validatedData.is_primary ?? false,
    joined_at: now,
    created_at: now,
    updated_at: now,
  };

  const query = `
    INSERT INTO user_companies (
      id, user_id, company_id, role, permissions,
      is_active, is_primary, joined_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.execute(query, [
    userCompany.id,
    userCompany.user_id,
    userCompany.company_id,
    userCompany.role,
    JSON.stringify(userCompany.permissions),
    userCompany.is_active,
    userCompany.is_primary,
    userCompany.joined_at,
    userCompany.created_at,
    userCompany.updated_at,
  ]);

  return userCompany;
}

/**
 * Get user companies by user ID
 *
 * @param userId - User ID
 * @param includeInactive - Include inactive associations (default: false)
 * @returns Array of user-company associations
 */
export async function getUserCompaniesByUserId(
  userId: string,
  includeInactive = false
): Promise<UserCompany[]> {
  let query = `
    SELECT * FROM user_companies
    WHERE user_id = ?
  `;

  if (!includeInactive) {
    query += " AND is_active = true";
  }

  query += " ORDER BY is_primary DESC, joined_at ASC";

  const [rows] = await db.execute<UserCompany>(query, [userId]);
  return rows;
}

/**
 * Get user companies with company details
 *
 * @param userId - User ID
 * @returns Array of user companies with company information
 */
export async function getUserCompaniesWithDetails(
  userId: string
): Promise<
  Array<UserCompany & { company_name: string; company_slug: string }>
> {
  const query = `
    SELECT 
      uc.*,
      c.name as company_name,
      c.slug as company_slug
    FROM user_companies uc
    INNER JOIN companies c ON uc.company_id = c.id
    WHERE uc.user_id = ? AND uc.is_active = true AND c.is_active = true
    ORDER BY uc.is_primary DESC, uc.joined_at ASC
  `;

  const [rows] = await db.execute(query, [userId]);
  return rows as Array<
    UserCompany & { company_name: string; company_slug: string }
  >;
}

/**
 * Update user-company association
 *
 * @param associationId - User-company association ID
 * @param userCompanyData - User company update data
 * @returns Updated user-company association
 * @throws Error if association not found or validation fails
 */
export async function updateUserCompany(
  associationId: string,
  userCompanyData: UpdateUserCompany
): Promise<UserCompany> {
  // Validate input
  const validatedData = updateUserCompanySchema.parse(userCompanyData);

  // Build update query dynamically
  const updates: string[] = [];
  const params: unknown[] = [];

  if (validatedData.role !== undefined) {
    updates.push("role = ?");
    params.push(validatedData.role);
  }

  if (validatedData.permissions !== undefined) {
    updates.push("permissions = ?");
    params.push(JSON.stringify(validatedData.permissions));
  }

  if (validatedData.is_active !== undefined) {
    updates.push("is_active = ?");
    params.push(validatedData.is_active);
  }

  if (validatedData.is_primary !== undefined) {
    updates.push("is_primary = ?");
    params.push(validatedData.is_primary);
  }

  if (updates.length === 0) {
    // No updates provided
    const userCompany = await getUserCompanyById(associationId);
    if (!userCompany) {
      throw new Error("User-company association not found");
    }
    return userCompany;
  }

  // Always update updated_at
  updates.push("updated_at = ?");
  params.push(new Date());

  // Add associationId to params for WHERE clause
  params.push(associationId);

  const query = `
    UPDATE user_companies
    SET ${updates.join(", ")}
    WHERE id = ?
  `;

  await db.execute(query, params);

  // Fetch and return updated association
  const updatedAssociation = await getUserCompanyById(associationId);

  if (!updatedAssociation) {
    throw new Error("Failed to retrieve updated user-company association");
  }

  return updatedAssociation;
}

/**
 * Get user-company association by ID
 *
 * @param associationId - Association ID
 * @returns User-company association or null if not found
 */
export async function getUserCompanyById(
  associationId: string
): Promise<UserCompany | null> {
  const query = "SELECT * FROM user_companies WHERE id = ?";
  return await db.queryOne<UserCompany>(query, [associationId]);
}

/**
 * Remove user from company (soft delete by setting is_active = false)
 *
 * @param associationId - User-company association ID
 * @returns True if successful
 * @throws Error if association not found
 */
export async function removeUserFromCompany(
  associationId: string
): Promise<boolean> {
  const association = await getUserCompanyById(associationId);

  if (!association) {
    throw new Error("User-company association not found");
  }

  const query = `
    UPDATE user_companies
    SET is_active = false, updated_at = ?
    WHERE id = ?
  `;

  await db.execute(query, [new Date(), associationId]);

  return true;
}

/**
 * Set primary company for user
 * Ensures only one primary company per user
 *
 * @param userId - User ID
 * @param companyId - Company ID to set as primary
 * @returns Updated user-company association
 * @throws Error if user or association not found
 */
export async function setPrimaryCompany(
  userId: string,
  companyId: string
): Promise<UserCompany> {
  // Get user companies
  const companies = await getUserCompaniesByUserId(userId);

  // Find the target association
  const targetAssociation = companies.find(
    (uc) => uc.company_id === companyId && uc.is_active
  );

  if (!targetAssociation) {
    throw new Error("User-company association not found");
  }

  // Unset all primary companies for this user
  for (const uc of companies.filter(
    (c) => c.is_primary && c.id !== targetAssociation.id
  )) {
    await updateUserCompany(uc.id, { is_primary: false });
  }

  // Set the target association as primary
  const updated = await updateUserCompany(targetAssociation.id, {
    is_primary: true,
  });

  return updated;
}

/**
 * Check if user has access to company
 *
 * @param userId - User ID
 * @param companyId - Company ID
 * @returns True if user has active access to the company
 */
export async function userHasCompanyAccess(
  userId: string,
  companyId: string
): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as count
    FROM user_companies
    WHERE user_id = ? AND company_id = ? AND is_active = true
  `;

  const [rows] = await db.execute<{ count: number }>(query, [
    userId,
    companyId,
  ]);
  return (rows[0]?.count || 0) > 0;
}

/**
 * Update user last login timestamp
 *
 * @param userId - User ID
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const query = `
    UPDATE users
    SET last_login = ?, updated_at = ?
    WHERE id = ?
  `;

  await db.execute(query, [new Date(), new Date(), userId]);
}
