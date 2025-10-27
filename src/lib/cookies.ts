/**
 * Client-side cookie utility functions
 * For managing cookies in the browser (client components only)
 */

const ACTIVE_COMPANY_COOKIE_NAME = 'active_company_id';
const ACTIVE_COMPANY_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

