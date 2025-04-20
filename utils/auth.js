import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Get all users (admin only)
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

// Find user by email
export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
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

// Find user by ID
export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
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

// Authenticate user (login)
export const authenticateUser = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return { success: false, message: 'Incorrect password' };
  }

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;

  return {
    success: true,
    message: 'Login successful',
    user: userWithoutPassword
  };
};

// Register new user
export const registerUser = async (userData) => {
  // Check if email already exists
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    return { success: false, message: 'Email already in use' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || null,
      role: 'USER',
      emailVerified: false
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
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

  return {
    success: true,
    message: 'Registration successful',
    user: newUser
  };
};

// Update user profile
export const updateUserProfile = async (userId, updatedData) => {
  try {
    // Don't allow changing email to one that already exists
    if (updatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updatedData.email.toLowerCase(),
          NOT: {
            id: userId
          }
        }
      });

      if (existingUser) {
        return { success: false, message: 'Email already in use' };
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updatedData,
        email: updatedData.email?.toLowerCase()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
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

    return {
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, message: 'Failed to update profile' };
  }
};

// Change password
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: 'Failed to change password' };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Email not found' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // In a real application, you would send an email with the reset token
    return {
      success: true,
      message: 'Password reset instructions have been sent to your email'
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: 'Failed to process password reset' };
  }
};

// Get the current user from the token
export const getCurrentUser = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded || Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      return null;
    }

    const user = await findUserById(decoded.userId);
    return user;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Login user and store token
export const loginUser = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const currentUser = await getCurrentUser();
  return !!currentUser;
};

// Get auth token
export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '60m' }
  );
}

export async function verifyToken(token) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.userId);
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}
