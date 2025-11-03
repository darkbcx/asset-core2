import { NextRequest, NextResponse } from 'next/server';
import { refreshToken } from '@/backend/authentication';
import { createSafeUserResponse } from '@/lib/utils';
import { rateLimit, setRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit per refresh token hash/IP (fallback)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ip = request.headers.get('x-forwarded-for') || (request as any).ip || 'anon';
    const limited = await rateLimit(`refresh:${ip}`, { windowMs: 60_000, max: 60 }); // 60 req/min
    if (!limited.ok) return limited.response;

    const body = await request.json();
    const token = body.refreshToken;
    
    if (!token) {
      const res = NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
      return setRateLimitHeaders(res, `refresh:${ip}`, { windowMs: 60_000, max: 60 });
    }
    
    // Refresh the token
    const result = await refreshToken(token);
    
    if (!result.success) {
      const res = NextResponse.json(
        { error: result.error || 'Invalid token' },
        { status: 401 }
      );
      return setRateLimitHeaders(res, `refresh:${ip}`, { windowMs: 60_000, max: 60 });
    }
    
    // Return new tokens in response - client will manage them
    // User object follows validator schema (snake_case, omits password_hash)
    const res = NextResponse.json({
      success: true,
      token: result.result!.token,
      refreshToken: result.result!.refreshToken,
      expiresIn: result.result!.expiresIn,
      user: createSafeUserResponse(result.result!.user),
    });
    return setRateLimitHeaders(res, `refresh:${ip}`, { windowMs: 60_000, max: 60 });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
