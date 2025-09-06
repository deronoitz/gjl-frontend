import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';

export async function POST(request: NextRequest) {
  try {
    const { houseNumber, password } = await request.json();

    if (!houseNumber || !password) {
      return NextResponse.json(
        { error: 'House number and password are required' },
        { status: 400 }
      );
    }

    const result = await CustomAuth.login({ houseNumber, password });

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid house number or password' },
        { status: 401 }
      );
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    // Set session cookie
    response.cookies.set('session_token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
