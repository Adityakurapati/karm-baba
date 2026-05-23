import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { isValidEmail } from '@/lib/validation';

const FIREBASE_DATABASE_URL = "https://thirdeye-1e99c-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Firebase RTDB with expiration (we'll just store timestamp)
    const emailSafe = email.replace(/[^a-zA-Z0-9]/g, '_');
    const rtdbResponse = await fetch(`${FIREBASE_DATABASE_URL}/verification_codes/${emailSafe}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        createdAt: new Date().toISOString(),
      })
    });

    if (!rtdbResponse.ok) {
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
    }

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Assuming Gmail since it's an app password
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // User needs to set this in .env.local
        pass: process.env.EMAIL_PASS || 'tbsp qcjk zguo utig',
      },
    });

    // Send email
    const mailOptions = {
      from: `"KARM BABA" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: email,
      subject: 'Your KARM BABA Verification Code',
      text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to KARM BABA</h2>
          <p>Thank you for registering. Please use the following code to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Verification code sent' }, { status: 200 });
  } catch (error: any) {
    console.error('Send verification API Error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
