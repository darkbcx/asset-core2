import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken, mintTokensForUser, storeRefreshToken, revokeAllForUser } from '@/backend/authentication';
import { getUserWithCompanies } from '@/backend/user';

const setActiveCompanySchema = z.object({
  companyId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = setActiveCompanySchema.parse(body);
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify token and get user
    const decoded = verifyToken(token);
    const userResult = await getUserWithCompanies(decoded.sub);
    
    if (!userResult.success || !userResult.result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userResult.result;
    
    // Only tenant users can set active company
    if (user.user_type !== 'tenant') {
      return NextResponse.json(
        { error: 'Only tenant users can set active company' },
        { status: 403 }
      );
    }
    
    // Verify user has access to this company
    const hasAccess = user.companies?.some(
      (company) => company.company_id === validatedData.companyId && company.is_active
    );
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Company access denied' },
        { status: 403 }
      );
    }
    
    // Mint new JWTs embedding active company context
    const minted = mintTokensForUser(decoded.sub, validatedData.companyId);

    // Revoke existing refresh tokens for this user and store the new one
    revokeAllForUser(decoded.sub);
    const refreshExpiresAt = Date.now() + (minted.expiresIn * 1000); // approximate; if separate refresh exp, adjust accordingly
    storeRefreshToken(decoded.sub, minted.refreshToken, refreshExpiresAt);

    return NextResponse.json({
      success: true,
      companyId: validatedData.companyId,
      token: minted.token,
      refreshToken: minted.refreshToken,
      expiresIn: minted.expiresIn,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 }
      );
    }
    
    console.error('Set active company error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

