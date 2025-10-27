import { NextRequest, NextResponse } from 'next/server';
import { refreshToken } from '@/backend/authentication';

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
    return NextResponse.json({
      success: true,
      token: result.result!.token,
      refreshToken: result.result!.refreshToken,
      expiresIn: result.result!.expiresIn,
      user: {
        id: result.result!.user.id,
        email: result.result!.user.email,
        firstName: result.result!.user.first_name,
        lastName: result.result!.user.last_name,
        userType: result.result!.user.user_type,
        systemRole: result.result!.user.system_role,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
