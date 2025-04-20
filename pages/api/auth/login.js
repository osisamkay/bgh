import { authenticateUser } from '@/utils/auth';
import rateLimit from '@/utils/rateLimit';

// Create limiter: 10 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // Max 100 users per minute
});

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Apply rate limiting
    try {
      await limiter.check(res, 10, 'login'); // 10 requests per minute
    } catch (rateError) {
      // The limiter already sent a response
      return;
    }

    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Authenticate user
    const result = await authenticateUser(email, password);

    // Handle authentication failure
    if (!result || result.success !== true) {
      return res.status(401).json({
        success: false,
        message: result?.message || 'Authentication failed'
      });
    }

    // Check if email verification is required
    if (result.requiresVerification === true) {
      return res.status(200).json({
        success: true,
        message: 'Login successful but email verification required',
        requiresVerification: true,
        token: result.accessToken || '',
        refreshToken: result.refreshToken || '',
        user: result.user || {}
      });
    }

    // Email is verified, handle normal login
    // Set secure cookie for refresh token if in production
    if (process.env.NODE_ENV === 'production' && result.refreshToken) {
      res.setHeader('Set-Cookie', [
        `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${rememberMe ? 604800 : 86400}`
      ]);

      // Return response without the refresh token in body
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: result.accessToken || '',
        user: result.user || {}
      });
    } else {
      // In development, include refresh token in response
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: result.accessToken || '',
        refreshToken: result.refreshToken || '',
        user: result.user || {}
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}