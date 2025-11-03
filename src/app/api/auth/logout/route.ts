import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, revokeAllForUser, revokeRefreshToken } from '@/backend/authentication';

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Try to extract user id from Authorization header (if present)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = verifyToken(token);
        userId = decoded.sub || null;
      } catch {
        // ignore invalid access token on logout
      }
    }

    // Optionally accept refreshToken in body and revoke it
    try {
      const body = await request.json();
      const refreshToken = body?.refreshToken as string | undefined;
      if (refreshToken) {
        revokeRefreshToken(refreshToken);
      }
    } catch {
      // no body or invalid JSON, ignore
    }

    // If we know the user id, revoke all remaining tokens for user
    if (userId) {
      revokeAllForUser(userId);
    }

    // Return success - client will clear tokens from cookies/local storage
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
