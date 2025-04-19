import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

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
        message: 'Invalid verification token'
      });
    }

    // Check if token has expired
    if (new Date() > verificationToken.expiresAt) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      });
      
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new verification email.'
      });
    }

    // Update user's email verification status
    const updatedUser = await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true }
    });

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    // Generate JWT token for automatic login
    const jwtToken = jwt.sign(
      { 
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      token: jwtToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during email verification'
    });
  }
} 