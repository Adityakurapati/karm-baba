import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from './otp-store';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    console.log('\n========== SEND OTP ==========');
    console.log('Phone:', phone);

    if (!phone) {
      console.log('Phone number missing');

      return NextResponse.json(
        {
          success: false,
          error: 'Phone number is required',
        },
        { status: 400 }
      );
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log('Generated OTP:', otp);

    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log('OTP saved in memory');

    const cleanNumber = phone
      .replace('+91', '')
      .replace(/\D/g, '');

    const url =
      `https://www.fast2sms.com/dev/bulkV2` +
      `?authorization=${process.env.FAST2SMS_API_KEY}` +
      `&route=otp` +
      `&variables_values=${otp}` +
      `&flash=0` +
      `&numbers=${cleanNumber}`;

    console.log('Calling Fast2SMS...');
    console.log(
      'Number:',
      cleanNumber
    );

    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    console.log(
      'Fast2SMS Response:',
      JSON.stringify(data, null, 2)
    );

    if (
      data.return === false ||
      data.status_code !== 200
    ) {
      console.log('Fast2SMS failed');

      return NextResponse.json({
        success: false,
        error:
          data.message ||
          'Failed to send OTP',
      });
    }

    console.log('OTP sent successfully');
    console.log('==============================\n');

    return NextResponse.json({
      success: true,

      ...(process.env.NODE_ENV ===
      'development'
        ? { code: otp }
        : {}),
    });
  } catch (error) {
    console.error(
      'SEND OTP ERROR:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}