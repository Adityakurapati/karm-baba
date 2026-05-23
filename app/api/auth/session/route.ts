import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, expiresIn, role } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Default to 1 hour (3600 seconds) if expiresIn is not provided
    const maxAge = expiresIn ? parseInt(expiresIn) : 3600;

    const response = NextResponse.json({ success: true }, { status: 200 });

    const cookieName = role === 'admin' ? 'admin_auth_token' : 'auth_token';

    // Set the HttpOnly cookie for the session
    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });

    return response;
  } catch (error) {
    console.error('Session API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
