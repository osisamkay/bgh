import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-jwt';

// Authenticate user with secure token generation
export const authenticateUser = async (email, password) => {
  // Defensive check for inputs
  if (!email || !password) {
    return {
      success: false,
      message: 'Email and password are required',
      user: null
    };
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true
      }
    });

    // User not found
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
        user: null
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    // Invalid password
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password',
        user: null
      };
    }

    // Create safe user object without password
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'USER',
      emailVerified: user.emailVerified || false
    };

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || 'USER',
        emailVerified: user.emailVerified || false
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Check if email verification is required
    if (!user.emailVerified) {
      return {
        success: true,
        requiresVerification: true,
        message: 'Email verification required',
        user: safeUser,
        accessToken,
        refreshToken
      };
    }

    // Email is verified
    return {
      success: true,
      message: 'Login successful',
      user: safeUser,
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'An error occurred during authentication',
      error: error.message,
      user: null
    };
  }
};

// Verify JWT token
export const verifyToken = async (token) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('JWT decoded:', decoded); // Debug log

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        emailVerified: true,
        phone: true
      }
    });

    if (!user) return null;

    // Return both the decoded token and user data
    return {
      ...decoded,
      ...user
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export const findUserByEmail = async (email) => {
  if (!email) return null;

  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      role: true,
      emailVerified: true,
      password: true,
      phone: true,
      streetAddress: true,
      city: true,
      province: true,
      postalCode: true,
      country: true,
      customerId: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

export const findUserById = async (id) => {
  if (!id) return null;

  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      role: true,
      emailVerified: true,
      phone: true,
      streetAddress: true,
      city: true,
      province: true,
      postalCode: true,
      country: true,
      customerId: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

export async function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Add function for password reset token
export const generatePasswordResetToken = async (userId) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store hashed version of token in database
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  await prisma.resetPasswordToken.upsert({
    where: { userId },
    update: {
      token: hashedToken,
      expiresAt: tokenExpiry
    },
    create: {
      userId,
      token: hashedToken,
      expiresAt: tokenExpiry
    }
  });

  // Return unhashed token to send via email
  return resetToken;
};

// Register new user with improved validation
export const registerUser = async (userData) => {
  try {
    // Validate required fields
    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'streetAddress',
      'city', 'postalCode', 'province', 'country'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email.toLowerCase() }
    });

    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Password strength validation
    if (userData.password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long' };
    }

    // Hash password with increased security
    const salt = await bcrypt.genSalt(12); // Increased from 10
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        streetAddress: userData.streetAddress,
        city: userData.city,
        postalCode: userData.postalCode,
        province: userData.province,
        country: userData.country,
        role: 'USER',
        emailVerified: false,
        termsAccepted: userData.termsAccepted || false,
        phone: userData.phone || null
      }
    });

    // Generate verification token
    const verificationToken = await generateVerificationToken();

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword,
      verificationToken
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
};

// Verify refresh token and generate new access token
export const verifyRefreshToken = async (refreshToken) => {
  if (!refreshToken) return null;

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        emailVerified: true,
        phone: true
      }
    });

    if (!user) return null;

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || 'USER',
        emailVerified: user.emailVerified || false
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return {
      user,
      accessToken
    };
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
};

// Generate new access token
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role || 'USER',
      emailVerified: user.emailVerified || false
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};