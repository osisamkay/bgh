import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const RESET_TOKENS_FILE = path.join(process.cwd(), 'data', 'reset-tokens.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Please provide an email address'
      });
    }

    // Read users file
    let users = { users: [] };
    try {
      const fileContent = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(fileContent);
    } catch (error) {
      return res.status(500).json({ message: 'Error reading users database' });
    }

    // Find user
    const user = users.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // For security reasons, we still return success even if the email doesn't exist
      return res.status(200).json({
        message: 'If an account exists with this email, you will receive password reset instructions'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Save reset token
    let resetTokens = { tokens: [] };
    try {
      const tokenFileContent = fs.readFileSync(RESET_TOKENS_FILE, 'utf8');
      resetTokens = JSON.parse(tokenFileContent);
    } catch (error) {
      // If file doesn't exist, we'll create it
      console.log('Creating new reset tokens file');
    }

    // Remove any existing tokens for this user
    resetTokens.tokens = resetTokens.tokens.filter(t => t.userId !== user.id);

    // Add new token
    resetTokens.tokens.push({
      userId: user.id,
      token: resetToken,
      expiry: tokenExpiry.toISOString()
    });

    // Write tokens back to file
    fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(resetTokens, null, 2));

    // In a real application, you would send an email here with the reset link
    // For now, we'll just return success
    res.status(200).json({
      message: 'If an account exists with this email, you will receive password reset instructions'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 