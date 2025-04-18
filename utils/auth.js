import userData from '../data/users.json';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// In a real application, you would use a secure way to store users
// This is just for demonstration purposes
let users = userData.users;

// Function to simulate saving to our "database"
const saveToDatabase = (updatedUsers) => {
  users = updatedUsers;
  // In a real application, you would write to the file or database
  console.log('Database updated:', users);
  return true;
};

// Get all users (admin only in a real app)
export const getAllUsers = () => {
  return users;
};

// Find user by email
export const findUserByEmail = (email) => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Find user by ID
export const findUserById = (id) => {
  return users.find(user => user.id === id);
};

// Authenticate user (login)
export const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  if (user.password !== password) {
    return { success: false, message: 'Incorrect password' };
  }
  
  // Create a user object without the password
  const { password: _, ...userWithoutPassword } = user;
  
  return { 
    success: true, 
    message: 'Login successful', 
    user: userWithoutPassword
  };
};

// Register new user
export const registerUser = (userData) => {
  // Check if email already exists
  const existingUser = findUserByEmail(userData.email);
  
  if (existingUser) {
    return { success: false, message: 'Email already in use' };
  }
  
  // Validate password requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(userData.password)) {
    return { 
      success: false, 
      message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character' 
    };
  }
  
  // Create new user object
  const newUser = {
    id: uuidv4(),
    ...userData,
    joinedDate: new Date().toISOString().split('T')[0],
    reservations: []
  };
  
  // Add to "database"
  const updatedUsers = [...users, newUser];
  saveToDatabase(updatedUsers);
  
  // Return success without password
  const { password: _, ...userWithoutPassword } = newUser;
  return { 
    success: true, 
    message: 'Registration successful',
    user: userWithoutPassword
  };
};

// Update user profile
export const updateUserProfile = (userId, updatedData) => {
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  // Don't allow changing email to one that already exists
  if (updatedData.email && updatedData.email !== users[userIndex].email) {
    const emailExists = users.some(user => 
      user.id !== userId && user.email.toLowerCase() === updatedData.email.toLowerCase()
    );
    
    if (emailExists) {
      return { success: false, message: 'Email already in use' };
    }
  }
  
  // Update user
  const updatedUser = { ...users[userIndex], ...updatedData };
  const updatedUsers = [...users];
  updatedUsers[userIndex] = updatedUser;
  
  saveToDatabase(updatedUsers);
  
  // Return updated user without password
  const { password: _, ...userWithoutPassword } = updatedUser;
  return { 
    success: true, 
    message: 'Profile updated successfully',
    user: userWithoutPassword
  };
};

// Change password
export const changePassword = (userId, currentPassword, newPassword) => {
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  // Verify current password
  if (users[userIndex].password !== currentPassword) {
    return { success: false, message: 'Current password is incorrect' };
  }
  
  // Validate new password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return { 
      success: false, 
      message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character' 
    };
  }
  
  // Update password
  const updatedUser = { ...users[userIndex], password: newPassword };
  const updatedUsers = [...users];
  updatedUsers[userIndex] = updatedUser;
  
  saveToDatabase(updatedUsers);
  
  return { success: true, message: 'Password changed successfully' };
};

// Reset password (in a real app, this would send an email)
export const resetPassword = (email) => {
  const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
  
  if (userIndex === -1) {
    return { success: false, message: 'Email not found' };
  }
  
  // In a real application, generate a reset token and send an email
  // For this demo, we'll just simulate a successful reset request
  
  return { 
    success: true, 
    message: 'Password reset instructions have been sent to your email'
  };
};

// Get the current user from the token stored in localStorage or sessionStorage
export const getCurrentUser = () => {
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
      // Token is invalid or expired
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      return null;
    }
    return decoded;
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
export const isAuthenticated = () => {
  const currentUser = getCurrentUser();
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
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}

export async function verifyToken(token) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
