import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '../../../utils/email';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      streetAddress,
      city,
      postalCode,
      province,
      country,
      termsAccepted,
      isAdmin = false // Add isAdmin flag
    } = req.body;

    // Validate required fields with specific messages
    const missingFields = [];
    if (!firstName) missingFields.push('First Name');
    if (!lastName) missingFields.push('Last Name');
    if (!email) missingFields.push('Email');
    if (!password) missingFields.push('Password');
    if (!termsAccepted) missingFields.push('Terms and Conditions');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: missingFields.join(', ')
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        details: 'Please enter a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Weak password',
        details: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered',
        details: 'This email address is already in use. Please use a different email or try logging in.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role based on isAdmin flag
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        streetAddress,
        city,
        postalCode,
        province,
        country,
        termsAccepted,
        role: isAdmin ? 'ADMIN' : 'USER'
      }
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: tokenExpiry
      }
    });

    // Send verification email
    let emailResult = null;
    try {
      emailResult = await sendVerificationEmail({
        to: email,
        token: verificationToken,
        name: `${firstName} ${lastName}`
      });

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        return res.status(200).json({
          message: 'User registered successfully, but verification email could not be sent.',
          details: 'Please contact support to verify your email address.',
          userId: user.id,
          isAdmin: user.role === 'ADMIN'
        });
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(200).json({
        message: 'User registered successfully, but verification email could not be sent.',
        details: 'Please contact support to verify your email address.',
        userId: user.id,
        isAdmin: user.role === 'ADMIN'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      details: 'Please check your email to verify your account.',
      userId: user.id,
      isAdmin: user.role === 'ADMIN',
      emailDetails: emailResult ? {
        previewUrl: emailResult.previewUrl,
        messageId: emailResult.messageId,
        etherealUser: emailResult.etherealUser,
        etherealPass: emailResult.etherealPass
      } : null
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unexpected error occurred. Please try again later.'
    });
  }
} 