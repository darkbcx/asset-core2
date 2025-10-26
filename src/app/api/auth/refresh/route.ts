import { NextRequest, NextResponse } from 'next/server';
import { refreshToken } from '@/backend/authentication';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
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
    
    // Return new token in response
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        userType: result.user.user_type,
        systemRole: result.user.system_role,
      },
    });
    
    // Set new token cookie
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
