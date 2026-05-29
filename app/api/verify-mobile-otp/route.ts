import { NextResponse } from 'next/server';

const FIREBASE_DATABASE_URL = "https://thirdeye-1e99c-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ success: false, error: 'Phone number and OTP are required' }, { status: 400 });
    }

    const phoneSafe = phone.replace(/[^0-9]/g, '');
    const verifyResponse = await fetch(`${FIREBASE_DATABASE_URL}/mobile_verification_codes/${phoneSafe}.json`);
    const verifyData = await verifyResponse.json();

    if (!verifyData || verifyData.code !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Code is valid. Clean it up
    await fetch(`${FIREBASE_DATABASE_URL}/mobile_verification_codes/${phoneSafe}.json`, { method: 'DELETE' });

    return NextResponse.json({ success: true, message: 'Mobile number verified successfully' });
  } catch (error: any) {
    console.error('Verify mobile OTP error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify OTP' }, { status: 500 });
  }
}
