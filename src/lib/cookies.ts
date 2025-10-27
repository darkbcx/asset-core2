/**
 * Client-side cookie utility functions
 * For managing cookies in the browser (client components only)
 */

const ACTIVE_COMPANY_COOKIE_NAME = 'active_company_id';
const ACTIVE_COMPANY_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const TOKEN_COOKIE_NAME = 'token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const TOKEN_EXPIRES_COOKIE_NAME = 'token_expires_in';
const TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day

/**
 * Set active company ID in cookie
 */
export function setActiveCompanyCookie(companyId: string): void {
  document.cookie = `${ACTIVE_COMPANY_COOKIE_NAME}=${companyId}; path=/; max-age=${ACTIVE_COMPANY_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get active company ID from cookie
 */
export function getActiveCompanyCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === ACTIVE_COMPANY_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}

/**
 * Remove active company ID cookie
 */
export function removeActiveCompanyCookie(): void {
  document.cookie = `${ACTIVE_COMPANY_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Set authentication token in cookie
 */
export function setTokenCookie(token: string, expiresIn?: number|null): void {
  document.cookie = `${TOKEN_COOKIE_NAME}=${token}; path=/; max-age=${expiresIn ?? TOKEN_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get authentication token from cookie
 */
export function getTokenCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}

/**
 * Remove authentication token cookie
 */
export function removeTokenCookie(): void {
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Set refresh token in cookie
 */
export function setRefreshTokenCookie(refreshToken: string, expiresIn?: number|null): void {
  document.cookie = `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}; path=/; max-age=${expiresIn ?? TOKEN_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get refresh token from cookie
 */
export function getRefreshTokenCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === REFRESH_TOKEN_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}

/**
 * Remove refresh token cookie
 */
export function removeRefreshTokenCookie(): void {
  document.cookie = `${REFRESH_TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  removeTokenCookie();
  removeRefreshTokenCookie();
  removeActiveCompanyCookie();
}


