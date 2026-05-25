import { generateAadhaarOTP } from '@/lib/sandbox';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { aadhaar } = await req.json();

    if (!aadhaar || aadhaar.length !== 12) {
      return NextResponse.json({ success: false, error: 'Valid 12-digit Aadhaar number is required.' }, { status: 400 });
    }

    const result = await generateAadhaarOTP(aadhaar);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Send Aadhaar OTP API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}
