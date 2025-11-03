/**
 * Authentication utilities
 * Shared functions for authentication-related operations
 */

import { clearAuthCookies, getTokenCookie } from './cookies';

/**
 * Handle user logout
 * Clears all authentication cookies and localStorage, then redirects to login
 * 
 * @param router - Next.js router instance for navigation
 * @returns Promise that resolves when logout is complete
 */
export async function handleLogout(router: { push: (path: string) => void }): Promise<void> {
  try {
    // Clear all auth cookies
    clearAuthCookies();
    
    // Dispatch event to notify AuthProvider of logout
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Also clear localStorage for backward compatibility
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresIn');
      localStorage.removeItem('activeCompanyId');
    }
    
    // Optionally call logout API endpoint
    const token = getTokenCookie();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Ignore API errors - cookies are already cleared
        console.error('Logout API error:', error);
      }
    }
    
    // Redirect to login
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect even if there's an error
    router.push('/login');
  }
}

