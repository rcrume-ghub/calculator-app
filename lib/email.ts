import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendInviteEmail(to: string, name: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const loginLink = `${appUrl}/api/auth/accept?token=${token}`;

  await transporter.sendMail({
    from: `"Calculator App" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'You have been invited to Calculator App',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>You've been invited to use the Calculator App.</p>
        <p>Click the button below to accept your invite and log in:</p>
        <a href="${loginLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Accept Invite &amp; Log In
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px;">This link will expire in 7 days. If you didn't expect this email, you can ignore it.</p>
      </div>
    `,
  });
}
