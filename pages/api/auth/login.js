import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        verificationTokens: {
          where: {
            expiresAt: {
              gt: new Date()
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role || 'USER',
        emailVerified: user.emailVerified || false
      },
      JWT_SECRET,
      { expiresIn: '60m' }
    );

    // Check if email is verified
    if (!user.emailVerified) {
      const activeVerificationToken = user.verificationTokens[0];

      // Return success but with verification needed status
      return res.status(200).json({
        success: true,
        message: 'Login successful but email verification required',
        requiresVerification: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role || 'USER',
          emailVerified: false,
          emailVerifiedAt: null
        },
        verificationNeeded: {
          message: 'Please verify your email address to access all features',
          hasActiveToken: !!activeVerificationToken,
          tokenExpired: activeVerificationToken ? new Date(activeVerificationToken.expiresAt) < new Date() : true
        }
      });
    }

    // Return success with token and user data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || 'USER',
        emailVerified: true,
        emailVerifiedAt: user.emailVerifiedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
} 