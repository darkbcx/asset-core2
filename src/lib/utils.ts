import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type User } from "@/lib/validators/user"

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
