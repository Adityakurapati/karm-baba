import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '../send-mobile-otp/otp-store';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } =
      await req.json();

    console.log(
      '\n========== VERIFY OTP =========='
    );

    console.log('Phone:', phone);
    console.log('Entered OTP:', otp);

    const record =
      otpStore.get(phone);

    console.log(
      'Stored Record:',
      record
    );

    if (!record) {
      console.log(
        'No OTP found for phone'
      );

      return NextResponse.json({
        success: false,
        error:
          'OTP not found. Please resend.',
      });
    }

    const expired =
      Date.now() >
      record.expiresAt;

    console.log(
      'Expired:',
      expired
    );

    if (expired) {
      otpStore.delete(phone);

      console.log('OTP expired');

      return NextResponse.json({
        success: false,
        error:
          'OTP expired. Please resend.',
      });
    }

    const matched =
      record.otp === otp;

    console.log(
      'OTP Match:',
      matched
    );

    if (!matched) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OTP',
      });
    }

    otpStore.delete(phone);

    console.log(
      'Mobile verified successfully'
    );

    console.log(
      '================================\n'
    );

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error(
      'VERIFY OTP ERROR:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Verification failed',
      },
      { status: 500 }
    );
  }
}