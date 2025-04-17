import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
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
      termsAccepted
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !streetAddress || 
        !city || !postalCode || !province || !country || !termsAccepted) {
      return res.status(400).json({ 
        message: `Missing required fields: ${[
          !firstName && 'firstName',
          !lastName && 'lastName',
          !email && 'email',
          !password && 'password',
          !streetAddress && 'streetAddress',
          !city && 'city',
          !postalCode && 'postalCode',
          !province && 'province',
          !country && 'country',
          !termsAccepted && 'termsAccepted'
        ].filter(Boolean).join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        streetAddress,
        city,
        postalCode,
        province,
        country,
        termsAccepted
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 