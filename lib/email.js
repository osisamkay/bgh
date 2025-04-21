import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendPasswordResetEmail(email, resetLink) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Reset Your Password',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p style="margin: 20px 0;">
            <a 
              href="${resetLink}" 
              style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;"
            >
              Reset Password
            </a>
          </p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated email, please do not reply.
          </p>
        </div>
      `,
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        return { success: false, error: error.message };
    }
} 