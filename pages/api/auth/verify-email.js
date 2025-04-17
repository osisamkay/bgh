import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const VERIFICATION_TOKENS_FILE = path.join(process.cwd(), 'data', 'verification-tokens.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Read verification tokens
    const verificationTokensData = JSON.parse(fs.readFileSync(VERIFICATION_TOKENS_FILE, 'utf8'));
    
    // Find the token
    const tokenData = verificationTokensData.tokens.find(t => t.token === token);
    
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Check if token has expired
    if (new Date(tokenData.expiresAt) < new Date()) {
      // Remove expired token
      verificationTokensData.tokens = verificationTokensData.tokens.filter(t => t.token !== token);
      fs.writeFileSync(VERIFICATION_TOKENS_FILE, JSON.stringify(verificationTokensData, null, 2));
      
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Read users data
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    
    // Find and update user
    const userIndex = usersData.users.findIndex(user => user.id === tokenData.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user verification status
    usersData.users[userIndex].isVerified = true;
    usersData.users[userIndex].updatedAt = new Date().toISOString();
    
    // Save updated user data
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));

    // Remove used token
    verificationTokensData.tokens = verificationTokensData.tokens.filter(t => t.token !== token);
    fs.writeFileSync(VERIFICATION_TOKENS_FILE, JSON.stringify(verificationTokensData, null, 2));

    // Generate JWT token for automatic login
    const { password, ...userWithoutPassword } = usersData.users[userIndex];
    const authToken = jwt.sign(
      { userId: userWithoutPassword.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: userWithoutPassword,
      token: authToken
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
} 