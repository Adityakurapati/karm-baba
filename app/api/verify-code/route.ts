import { NextResponse } from 'next/server';
import { isValidEmail } from '@/lib/validation';

const FIREBASE_DATABASE_URL = "https://thirdeye-1e99c-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, verificationCode } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!verificationCode) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    // Verify the code from RTDB
    const emailSafe = email.replace(/[^a-zA-Z0-9]/g, '_');
    const verifyResponse = await fetch(`${FIREBASE_DATABASE_URL}/verification_codes/${emailSafe}.json`);
    const verifyData = await verifyResponse.json();

    if (!verifyData || verifyData.code !== verificationCode) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Code is valid. We don't delete it yet, because /api/register still needs to verify it again securely
    // before actually creating the user in Auth and RTDB.
    
    return NextResponse.json({ success: true, message: 'Email verified successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Verify code API Error:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
