import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createAuthContext } from '@/backend/authentication';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify token and get user info
    const userInfo = verifyToken(token);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Fetch user details with companies using backend function
    const authContextResult = await createAuthContext(token);
    
    if (!authContextResult.success || !authContextResult.result) {
      return NextResponse.json(
        { error: authContextResult.error || 'User not found' },
        { status: 404 }
      );
    }
    
    const { user, companies } = authContextResult.result;
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        systemRole: user.system_role,
      },
      companies,
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
