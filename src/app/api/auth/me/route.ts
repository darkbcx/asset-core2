import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/backend/authentication';
import { db } from '@/lib/db';

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
    
    // Fetch user details from database
    const [users] = await db.execute(
      'SELECT id, email, first_name, last_name, user_type, system_role FROM users WHERE id = ? AND is_active = true',
      [userInfo.userId]
    );
    
    const user = (users as any[])[0];
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Fetch user's company associations if tenant user
    let companies = [];
    if (user.user_type === 'tenant') {
      const [companyRows] = await db.execute(
        `SELECT uc.company_id, uc.role, uc.permissions, uc.is_primary, uc.is_active,
                c.name as company_name, c.slug as company_slug
         FROM user_companies uc
         JOIN companies c ON uc.company_id = c.id
         WHERE uc.user_id = ? AND uc.is_active = true AND c.is_active = true
         ORDER BY uc.is_primary DESC, uc.joined_at ASC`,
        [user.id]
      );
      companies = companyRows as any[];
    }
    
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
