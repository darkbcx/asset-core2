import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/backend/authentication';
import { loginSchema } from '@/lib/validators/user';
import { createSafeUserResponse } from '@/lib/utils';

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
    // User object follows validator schema (snake_case, omits password_hash)
    return NextResponse.json({
      success: true,
      token: result.result!.token,
      refreshToken: result.result!.refreshToken,
      expiresIn: result.result!.expiresIn,
      user: createSafeUserResponse(result.result!.user),
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
