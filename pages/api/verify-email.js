import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find the verification token and include the associated user
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Update user's email verification status
    await prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        name: verificationToken.user.name,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
} 