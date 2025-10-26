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

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { loginSchema, createUserSchema } from '@/lib/validators/user';
import type { User, CreateUser, Login } from '@/lib/validators/user';
import { 
  getUserByEmail,
  getUserById,
  getUserWithCompanies,
  updateLastLogin 
} from '@/backend/user';

/**
 * JWT configuration
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

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
  sub: string;              // Subject claim (user ID)
}

/**
 * Login with email and password
 * 
 * @param credentials - Login credentials (email and password)
 * @returns Authentication response with user and JWT tokens
 * @throws Error if credentials are invalid or user not found
 */
export async function login(credentials: Login): Promise<AuthResponse> {
  // Validate input
  const validatedCredentials = loginSchema.parse(credentials);
  
  // Find user by email
  const user = await getUserByEmail(validatedCredentials.email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Verify password
  const isPasswordValid = await verifyPassword(
    validatedCredentials.password,
    user.password_hash
  );
  
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }
  
  // Check if user is active
  if (!user.is_active) {
    throw new Error('Account is inactive. Please contact support.');
  }
  
  // Update last login timestamp
  await updateLastLogin(user.id);
  
  // Generate JWT tokens with standard claims only
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const tokenData = {
    sub: user.id,                    // Subject (user ID) - only claim needed
    iat: now,                         // Issued at
    aud: 'assetcore-client',          // Audience
    iss: 'assetcore',                 // Issuer
  };
  
  const token = generateToken(tokenData);
  const refreshToken = generateRefreshToken(tokenData);
  
  // Parse expires in to get numeric value
  const expiresIn = parseExpiresIn(JWT_EXPIRES_IN);
  
  return {
    user,
    token,
    refreshToken,
    expiresIn,
  };
}

/**
 * Refresh JWT token
 * 
 * @param refreshToken - Valid refresh token
 * @returns New authentication tokens
 * @throws Error if refresh token is invalid or expired
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    // Verify and decode refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTCustomClaims;
    
    // Validate token structure
    const userId = decoded.sub;
    if (!userId) {
      throw new Error('Invalid token structure');
    }
    
    // Get user from database
    const user = await getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user is still active
    if (!user.is_active) {
      throw new Error('Account is inactive');
    }
    
    // Generate new tokens with standard claims only
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const tokenData = {
      sub: user.id,                    // Subject (user ID) - only claim needed
      iat: now,                         // Issued at
      aud: 'assetcore-client',          // Audience
      iss: 'assetcore',                 // Issuer
    };
    
    const newToken = generateToken(tokenData);
    const newRefreshToken = generateRefreshToken(tokenData);
    const expiresIn = parseExpiresIn(JWT_EXPIRES_IN);
    
    return {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
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
      throw new Error('Invalid token: missing subject (sub) claim');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Extract user ID from JWT token
 * Uses standard JWT 'sub' claim for user ID
 * 
 * @param token - JWT token
 * @returns User ID
 * @throws Error if token is invalid or user ID not found
 */
export function getUserIdFromToken(token: string): string {
  const decoded = verifyToken(token);
  
  // Use standard JWT 'sub' claim for user ID
  const userId = decoded.sub;
  
  if (!userId) {
    throw new Error('Invalid token: user ID not found');
  }
  
  return userId;
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
  
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Hash password
  const passwordHash = await hashPassword(validatedData.password);
  
  // Create user
  const userId = uuidv4();
  const now = new Date();
  
  const user: User = {
    id: userId,
    user_type: validatedData.user_type,
    system_role: validatedData.system_role || null,
    email: validatedData.email,
    first_name: validatedData.first_name,
    last_name: validatedData.last_name || undefined,
    is_active: true,
    last_login: null,
    password_hash: passwordHash,
    system_permissions: validatedData.system_permissions || null,
    created_at: now,
    updated_at: now,
  };
  
  // Insert user into database
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
): Promise<void> {
  // Get user
  const user = await getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isPasswordValid = await verifyPassword(currentPassword, user.password_hash);
  
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
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
}

/**
 * Reset password (forgot password flow)
 * 
 * @param email - User email
 * @param newPassword - New password
 * @throws Error if user not found
 */
export async function resetPassword(email: string, newPassword: string): Promise<void> {
  // Find user by email
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('User not found');
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
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 * 
 * @param data - Token payload data
 * @returns JWT token string
 */
function generateToken(data: Record<string, unknown>): string {
  return jwt.sign(data, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN as string | number,
    issuer: 'assetcore',
    audience: 'assetcore-client',
  } as jwt.SignOptions);
}

/**
 * Generate JWT refresh token
 * 
 * @param data - Token payload data
 * @returns JWT refresh token string
 */
function generateRefreshToken(data: Record<string, unknown>): string {
  return jwt.sign(data, JWT_SECRET as string, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as string | number,
    issuer: 'assetcore',
    audience: 'assetcore-client',
  } as jwt.SignOptions);
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
 * Authentication utilities
 */
export const authUtils = {
  /**
   * Extract JWT token from Authorization header
   * 
   * @param authHeader - Authorization header value
   * @returns Token string or null
   */
  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) {
      return null;
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  },
  
  /**
   * Create auth context from token
   * 
   * @param token - JWT token
   * @returns Auth context with user information
   */
  async createAuthContext(token: string) {
    const decoded = verifyToken(token);
    
    // Get user ID from standard 'sub' claim
    const userId = decoded.sub;
    
    if (!userId) {
      throw new Error('Invalid token: user ID not found');
    }
    
    // Fetch full user details from database
    const user = await getUserWithCompanies(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      user,
      userId: userId,
      email: user.email,
      userType: user.user_type,
      systemRole: user.user_type === 'system_admin' ? user.system_role : null,
      companies: user.companies || [],
    };
  },
};

