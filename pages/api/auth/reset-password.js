// pages/api/auth/reset-password.js
import { prisma } from '../../../lib/prisma';
import { hash } from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the reset token and check if it's valid
    const resetToken = await prisma.resetPasswordToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - resetToken.createdAt.getTime();
    if (tokenAge > 24 * 60 * 60 * 1000) {
      // Delete expired token
      await prisma.resetPasswordToken.delete({
        where: { id: resetToken.id },
      });
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update user's password and delete the reset token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.resetPasswordToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
}