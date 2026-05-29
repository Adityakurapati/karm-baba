import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, orgName, pin, role } = await req.json();

    // Ensure environment variables exist
    const smtpUser = process.env.EMAIL_USER || 'test@example.com';
    const smtpPass = process.env.EMAIL_PASS || 'password';

    // Configure Nodemailer transporter (Defaults to ethereal/gmail structure)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this or use SMTP host/port
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Construct the email body
    const mailOptions = {
      from: `"KARM BABA Platform" <${smtpUser}>`,
      to: email,
      subject: `Invitation to join ${orgName} on KARM BABA`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4a90e2;">You've been invited!</h2>
          <p>You have been invited to join <strong>${orgName}</strong> as a <strong>${role.replace('_', ' ').toUpperCase()}</strong>.</p>
          <p>You can log in to the Organization Portal using your email address and the secure PIN below:</p>
          <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${pin}</span>
          </div>
          <p>To log in, visit: <a href="http://localhost:3000/organizations/login">http://localhost:3000/organizations/login</a></p>
          <p>Welcome to the platform!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">If you didn't expect this invitation, please ignore this email.</p>
        </div>
      `,
    };

    // Attempt to send
    try {
      if (process.env.EMAIL_USER) {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
      } else {
        console.log(`[MOCK EMAIL SENT to ${email}]: PIN is ${pin}`);
      }
    } catch (emailErr) {
      console.error('Nodemailer Error:', emailErr);
      // We log but don't fail the request completely for the demo if SMTP isn't setup
    }

    return NextResponse.json({ success: true, message: 'Invitation processed.' });
  } catch (error: any) {
    console.error('Error processing invite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
