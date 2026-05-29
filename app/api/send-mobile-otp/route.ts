import { NextResponse } from 'next/server';

const FIREBASE_DATABASE_URL = "https://thirdeye-1e99c-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Firebase RTDB
    const phoneSafe = phone.replace(/[^0-9]/g, '');
    const rtdbResponse = await fetch(`${FIREBASE_DATABASE_URL}/mobile_verification_codes/${phoneSafe}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        createdAt: new Date().toISOString(),
      })
    });

    if (!rtdbResponse.ok) {
      return NextResponse.json({ success: false, error: 'Failed to generate verification code' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Verification code sent', code });
  } catch (error: any) {
    console.error('Send mobile OTP error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}
