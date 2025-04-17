import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/utils/email';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Please provide an email address' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // For security reasons, we still return success even if the email doesn't exist
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive password reset instructions'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Delete any existing reset tokens for this user
    await prisma.resetToken.deleteMany({
      where: { userId: user.id }
    });

    // Create new reset token
    await prisma.resetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: tokenExpiry
      }
    });

    // Send reset email
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      `
    });

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive password reset instructions'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 