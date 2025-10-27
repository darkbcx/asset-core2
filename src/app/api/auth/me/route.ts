import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createAuthContext } from '@/backend/authentication';
import { getUserCompaniesWithDetails } from '@/backend/user';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
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
    
    // For tenant users, get companies with details (name, slug)
    let companiesWithDetails: Array<{
      company_id: string;
      company_name?: string;
      company_slug?: string;
      role: string;
      permissions: Record<string, Record<string, boolean>>;
      is_primary: boolean;
      is_active: boolean;
    }> = companies;
    
    if (user.user_type === 'tenant') {
      const companiesDetails = await getUserCompaniesWithDetails(user.id);
      companiesWithDetails = companiesDetails.map((comp) => ({
        company_id: comp.company_id,
        company_name: comp.company_name,
        company_slug: comp.company_slug,
        role: comp.role,
        permissions: comp.permissions,
        is_primary: comp.is_primary,
        is_active: comp.is_active,
      }));
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
      companies: companiesWithDetails,
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
