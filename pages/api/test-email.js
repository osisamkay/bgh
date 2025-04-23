import { sendVerificationEmail } from '@/utils/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    const { email = 'test@example.com' } = req.body;
    
    // Generate a test token
    const testToken = 'test-token-' + Math.random().toString(36).substring(2, 15);
    
    // Send a test verification email
    const result = await sendVerificationEmail({
      to: email,
      token: testToken,
      name: 'Test User'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      previewUrl: result.previewUrl,
      messageId: result.messageId,
      etherealUser: result.etherealUser,
      etherealPass: result.etherealPass,
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
}