import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { sendVerificationEmail } from '../../../utils/emailService';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const VERIFICATION_TOKENS_FILE = path.join(process.cwd(), 'data', 'verification-tokens.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Create users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }));
}

// Create verification-tokens.json if it doesn't exist
if (!fs.existsSync(VERIFICATION_TOKENS_FILE)) {
  fs.writeFileSync(VERIFICATION_TOKENS_FILE, JSON.stringify({ tokens: [] }));
}

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
      country
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'streetAddress',
      'city',
      'postalCode',
      'province',
      'country'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
      });
    }

    // Read existing users
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    // Check if user already exists
    if (usersData.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      firstName,
      lastName,
      password: hashedPassword,
      streetAddress,
      city,
      postalCode,
      province,
      country,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add user to database
    usersData.users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));

    // Generate verification token
    const verificationToken = uuidv4();
    const verificationTokensData = JSON.parse(fs.readFileSync(VERIFICATION_TOKENS_FILE, 'utf8'));
    
    // Remove any existing tokens for this email
    verificationTokensData.tokens = verificationTokensData.tokens.filter(
      token => token.email.toLowerCase() !== email.toLowerCase()
    );
    
    // Add new verification token
    verificationTokensData.tokens.push({
      token: verificationToken,
      userId: newUser.id,
      email: newUser.email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
    
    fs.writeFileSync(VERIFICATION_TOKENS_FILE, JSON.stringify(verificationTokensData, null, 2));

    // Send verification email
    try {
      await sendVerificationEmail({
        email: newUser.email,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        verificationToken
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the signup process if email fails
    }

    // Return success without sensitive data
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
} 