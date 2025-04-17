import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/utils/email';

export async function POST(req) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      streetAddress,
      city,
      postalCode,
      province,
      country,
      termsAccepted
    } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !termsAccepted) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        streetAddress,
        city,
        postalCode,
        province,
        country,
        termsAccepted,
        role: 'USER',
        isVerified: false
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
    await sendVerificationEmail({
      to: email,
      token: verificationToken,
      name: `${firstName} ${lastName}`
    });

    return NextResponse.json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: user.id
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 