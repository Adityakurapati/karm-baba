import { verifyAadhaarOTP } from '@/lib/sandbox';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { referenceId, otp } = await req.json();

    if (!referenceId || !otp) {
      return NextResponse.json({ success: false, error: 'Reference ID and OTP are required.' }, { status: 400 });
    }

    const result = await verifyAadhaarOTP(referenceId, otp);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Verify Aadhaar OTP API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify OTP' }, { status: 500 });
  }
}
