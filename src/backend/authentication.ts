/**
 * Authentication Backend Logic
 *
 * Custom authentication system using username/password credentials with JWT tokens.
 * Supports both tenant users and system administrators.
 *
 * Features:
 * - JWT token-based authentication
 * - Secure password hashing with bcrypt
 * - Token refresh mechanism
 * - Multi-tenant user support
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { loginSchema, createUserSchema } from "@/lib/validators/user";
import type {
  User,
  CreateUser,
  Login,
  UserCompany,
} from "@/lib/validators/user";
import {
  getUserByEmail,
  getUserById,
  getUserWithCompanies,
  updateLastLogin,
  createUser,
} from "@/backend/user";
import type { BackendResponse } from "@/backend/types";

/**
 * JWT configuration
 */
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

/**
 * Password hashing configuration
 */
const SALT_ROUNDS = 12;

/**
 * Authentication response types
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * JWT Token Claims
 * Uses only standard JWT claims
 */
export interface JWTCustomClaims extends jwt.JwtPayload {
  sub: string; // Subject claim (user ID)
  active_company_id?: string; // Active company context for tenant users
}

/**
 * Login with email and password
 *
 * @param credentials - Login credentials (email and password)
 * @returns Authentication response with user and JWT tokens
 */
export async function login(
  credentials: Login
): Promise<
  BackendResponse<AuthResponse & { companies: Record<string, unknown>[] }>
> {
  try {
    // Validate input
    const validatedCredentials = loginSchema.parse(credentials);

    // Find user by email
    const userResult = await getUserByEmail(validatedCredentials.email);

    if (!userResult.success || !userResult.result) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    const user = userResult.result;

    // Verify password
    const isPasswordValid = await verifyPassword(
      validatedCredentials.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if user is active
    if (!user.is_active) {
      return {
        success: false,
        error: "Account is inactive. Please contact support.",
      };
    }

    // Update last login timestamp
    await updateLastLogin(user.id);

    // Generate JWT tokens with standard claims only (no active company set yet)
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const tokenData = {
      sub: user.id, // Subject (user ID) - only claim needed
      iat: now, // Issued at
      aud: "assetcore-client", // Audience
      iss: "assetcore", // Issuer
    };

    const token = generateToken(tokenData);
    const refreshToken = generateRefreshToken(tokenData);

    // Parse expires in to get numeric value
    const expiresIn = parseExpiresIn(JWT_EXPIRES_IN);

    // Get user companies if tenant user
    let companies: Record<string, unknown>[] = [];
    if (user.user_type === "tenant") {
      const [companyRows] = await db.execute(
        `SELECT uc.company_id, uc.role, uc.permissions, uc.is_primary, uc.is_active,
                c.name as company_name, c.slug as company_slug
         FROM user_companies uc
         JOIN companies c ON uc.company_id = c.id
         WHERE uc.user_id = ? AND uc.is_active = true AND c.is_active = true
         ORDER BY uc.is_primary DESC, uc.joined_at ASC`,
        [user.id]
      );
      companies = companyRows as Record<string, unknown>[];
    }

    return {
      success: true,
      result: {
        user,
        token,
        refreshToken,
        expiresIn,
        companies,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}

/**
 * Refresh JWT token
 *
 * @param refreshToken - Valid refresh token
 * @returns New authentication tokens
 */
export async function refreshToken(
  refreshToken: string
): Promise<BackendResponse<RefreshTokenResponse & { user: User }>> {
  try {
    // Verify and decode refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTCustomClaims;

    // Validate token structure
    const userId = decoded.sub;
    if (!userId) {
      return {
        success: false,
        error: "Invalid token structure",
      };
    }

    // Get user from database
    const userResult = await getUserById(userId);

    if (!userResult.success || !userResult.result) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const user = userResult.result;

    // Check if user is still active
    if (!user.is_active) {
      return {
        success: false,
        error: "Account is inactive",
      };
    }

    // Generate new tokens; preserve active company claim if present on refresh token
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const tokenData: Record<string, unknown> = {
      sub: user.id,
      iat: now,
      aud: "assetcore-client",
      iss: "assetcore",
    };
    if ((decoded as JWTCustomClaims).active_company_id) {
      tokenData.active_company_id = (decoded as JWTCustomClaims).active_company_id;
    }

    const newToken = generateToken(tokenData);
    const newRefreshToken = generateRefreshToken(tokenData);
    const expiresIn = parseExpiresIn(JWT_EXPIRES_IN);

    return {
      success: true,
      result: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn,
        user,
      },
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        error: "Refresh token has expired",
      };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        error: "Invalid refresh token",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token refresh failed",
    };
  }
}

/**
 * Verify JWT token and get user information
 *
 * @param token - JWT token to verify
 * @returns Decoded token data with type safety
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JWTCustomClaims {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTCustomClaims;

    // Validate required claims
    if (!decoded.sub) {
      throw new Error("Invalid token: missing subject (sub) claim");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
}

/**
 * Register a new user
 *
 * @param userData - User registration data
 * @returns Created user
 * @throws Error if email already exists or validation fails
 */
export async function register(userData: CreateUser): Promise<User> {
  // Validate input
  const validatedData = createUserSchema.parse(userData);

  // Check if email already exists
  const existingUser = await getUserByEmail(validatedData.email);
  if (existingUser.success && existingUser.result) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await hashPassword(validatedData.password);

  // Delegate persistence to user repository
  const user = await createUser(validatedData, passwordHash);
  return user;
}

/**
 * Change user password
 *
 * @param userId - User ID
 * @param currentPassword - Current password for verification
 * @param newPassword - New password
 * @throws Error if current password is incorrect or user not found
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<BackendResponse<void>> {
  // Get user
  const { success, result: user } = await getUserById(userId);

  if (!success || !user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  // Verify current password
  const isPasswordValid = await verifyPassword(
    currentPassword,
    user.password_hash
  );

  if (!isPasswordValid) {
    return {
      success: false,
      error: "Current password is incorrect",
    };
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password in database
  const query = `
    UPDATE users
    SET password_hash = ?, updated_at = ?
    WHERE id = ?
  `;

  await db.execute(query, [newPasswordHash, new Date(), userId]);

  return {
    success: true,
    result: undefined,
  };
}

/**
 * Reset password (forgot password flow)
 *
 * @param email - User email
 * @param newPassword - New password
 * @throws Error if user not found
 */
export async function resetPassword(
  email: string,
  newPassword: string
): Promise<BackendResponse<void>> {
  // Find user by email
  const { success, result: user } = await getUserByEmail(email);

  if (!success || !user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password in database
  const query = `
    UPDATE users
    SET password_hash = ?, updated_at = ?
    WHERE id = ?
  `;

  await db.execute(query, [passwordHash, new Date(), user.id]);

  return {
    success: true,
    result: undefined,
  };
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Hash password using bcrypt
 *
 * @param password - Plain text password
 * @returns Hashed password
 */
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 *
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 *
 * @param data - Token payload data
 * @returns JWT token string
 */
function generateToken(data: Record<string, unknown>): string {
  return jwt.sign(
    data,
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN as string | number,
      // issuer: "assetcore",
      // audience: "assetcore-client",
    } as jwt.SignOptions
  );
}

/**
 * Generate JWT refresh token
 *
 * @param data - Token payload data
 * @returns JWT refresh token string
 */
function generateRefreshToken(data: Record<string, unknown>): string {
  return jwt.sign(
    data,
    JWT_SECRET as string,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN as string | number,
      // issuer: "assetcore",
      // audience: "assetcore-client",
    } as jwt.SignOptions
  );
}

/**
 * Mint access and refresh tokens for a user with optional active company context
 */
export function mintTokensForUser(
  userId: string,
  activeCompanyId?: string
): { token: string; refreshToken: string; expiresIn: number } {
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    sub: userId,
    iat: now,
    aud: "assetcore-client",
    iss: "assetcore",
  };
  if (activeCompanyId) {
    payload.active_company_id = activeCompanyId;
  }
  const token = generateToken(payload);
  const refresh = generateRefreshToken(payload);
  const expiresIn = parseExpiresIn(JWT_EXPIRES_IN);
  return { token, refreshToken: refresh, expiresIn };
}

/**
 * Parse expires in string to numeric seconds
 *
 * @param expiresIn - Expires in string (e.g., '7d', '24h', '30m')
 * @returns Numeric seconds
 */
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);

  if (!match) {
    return 7 * 24 * 60 * 60; // Default to 7 days in seconds
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return value * (multipliers[unit] || 604800); // Default to 7 days
}

/**
 * Extract JWT token from Authorization header
 * Simple utility function for parsing Bearer tokens
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Create auth context from token
 * Fetches user with companies and returns complete auth context
 *
 * @param token - JWT token
 * @returns Auth context with user information
 */
export async function createAuthContext(token: string): Promise<
  BackendResponse<{
    user: User;
    userId: string;
    email: string;
    userType: string;
    systemRole: string | null;
    companies: UserCompany[];
  }>
> {
  try {
    const decoded = verifyToken(token);

    // Get user ID from standard 'sub' claim
    const userId = decoded.sub;

    if (!userId) {
      return {
        success: false,
        error: "Invalid token: user ID not found",
      };
    }

    // Fetch full user details from database
    const userResult = await getUserWithCompanies(userId);

    if (!userResult.success || !userResult.result) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const user = userResult.result;

    return {
      success: true,
      result: {
        user,
        userId: userId,
        email: user.email,
        userType: user.user_type,
        systemRole: user.user_type === "system_admin" ? user.system_role : null,
        companies: user.companies || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create auth context",
    };
  }
}
