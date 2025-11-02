import { NextRequest, NextResponse } from 'next/server';
import { refreshToken } from '@/backend/authentication';
import { createSafeUserResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.refreshToken;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }
    
    // Refresh the token
    const result = await refreshToken(token);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Return new tokens in response - client will manage them
    // User object follows validator schema (snake_case, omits password_hash)
    return NextResponse.json({
      success: true,
      token: result.result!.token,
      refreshToken: result.result!.refreshToken,
      expiresIn: result.result!.expiresIn,
      user: createSafeUserResponse(result.result!.user),
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
