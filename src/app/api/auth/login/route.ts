import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/backend/authentication';
import { loginSchema } from '@/lib/validators/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Authenticate user
    const result = await login({ email: validatedData.email, password: validatedData.password });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Return token in response body - client will manage it
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
      companies: result.result!.companies,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
