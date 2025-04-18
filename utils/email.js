import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET
});

export const sendVerificationEmail = async ({ to, token, name }) => {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL,
            Name: 'Best Garden Hotel'
          },
          To: [
            {
              Email: to,
              Name: name
            }
          ],
          Subject: 'Verify your email address',
          HTMLPart: `
            <h2>Email Verification</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering with Best Garden Hotel. Please click the link below to verify your email address:</p>
            <p><a href="${verificationUrl}">Verify Email</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
          `
        }
      ]
    });
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}; 