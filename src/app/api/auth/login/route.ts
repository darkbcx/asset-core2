import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/backend/authentication';
import { loginSchema } from '@/lib/validators/user';
import { createSafeUserResponse } from '@/lib/utils';
import { rateLimit, setRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Basic per-IP rate limit (unauthenticated)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ip = request.headers.get('x-forwarded-for') || (request as any).ip || 'anon';
    const limited = await rateLimit(`login:${ip}`, { windowMs: 60_000, max: 30 }); // 30 req/min
    if (!limited.ok) return limited.response;

    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Authenticate user
    const result = await login({ email: validatedData.email, password: validatedData.password });
    
    if (!result.success) {
      const res = NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
      return setRateLimitHeaders(res, `login:${ip}`, { windowMs: 60_000, max: 30 });
    }
    
    // Return token in response body - client will manage it
    // User object follows validator schema (snake_case, omits password_hash)
    const res = NextResponse.json({
      success: true,
      token: result.result!.token,
      refreshToken: result.result!.refreshToken,
      expiresIn: result.result!.expiresIn,
      user: createSafeUserResponse(result.result!.user),
      companies: result.result!.companies,
    });
    return setRateLimitHeaders(res, `login:${ip}`, { windowMs: 60_000, max: 30 });
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
