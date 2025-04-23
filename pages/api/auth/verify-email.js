// pages/api/auth/verify-email.js
import prisma from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/utils/auth';
import { sendWelcomeEmail } from '@/utils/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find the verification token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token. The token may have been used or expired.'
      });
    }

    // Check if token has expired
    const now = new Date();
    if (now > verificationToken.expiresAt) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      });

      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new verification email.'
      });
    }

    // Check if user is already verified
    if (verificationToken.user.emailVerified) {
      // Delete the token since it's no longer needed
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      });

      return res.status(400).json({
        success: false,
        message: 'Email is already verified. Please log in.'
      });
    }

    // Update user's email verification status
    const updatedUser = await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    // Delete all verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: verificationToken.userId }
    });

    // Generate new tokens for automatic login
    const accessToken = generateAccessToken(updatedUser);
    const refreshToken = generateRefreshToken(updatedUser.id);

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: updatedUser.email,
        name: `${updatedUser.firstName} ${updatedUser.lastName}` || updatedUser.name || 'Valued Customer'
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with verification success even if welcome email fails
    }

    // Set secure cookie for refresh token in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Set-Cookie', [
        `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
      ]);

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully! You are now logged in.',
        token: accessToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          emailVerified: true
        }
      });
    } else {
      // In development, include refresh token in response
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully! You are now logged in.',
        token: accessToken,
        refreshToken: refreshToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          emailVerified: true
        }
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during email verification. Please try again.'
    });
  }
}