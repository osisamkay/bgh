import nodemailer from 'nodemailer';
import {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getReservationConfirmationTemplate,
  getPasswordResetTemplate
} from './emailTemplates';

let testAccount = null;

// Create Ethereal test account if it doesn't exist
const getTestAccount = async () => {
  if (testAccount) {
    return testAccount;
  }

  testAccount = await nodemailer.createTestAccount();
  console.log('Ethereal Email Account:', {
    user: testAccount.user,
    pass: testAccount.pass
  });
  return testAccount;
};

// Create transporter for sending emails
const createTransporter = async () => {
  const account = await getTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
};

// Generic email sending function
export const sendEmail = async ({ to, subject, html, from = '"Best Garden Hotel" <noreply@bgh-hotel.com>' }) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      etherealUser: testAccount.user,
      etherealPass: testAccount.pass
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendVerificationEmail(email, token) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  // If we're in development, just log the URL
  if (process.env.NODE_ENV === 'development') {
    console.log('Verification URL:', verificationUrl);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"BGH Support" <support@bestgardenhotel.com>',
    to: email,
    subject: 'Verify your email address',
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Verify your email address</h2>
                <p style="color: #666; line-height: 1.5;">
                    Thank you for signing up! Please click the button below to verify your email address.
                </p>
                <div style="margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #666; line-height: 1.5;">
                    If you didn't request this email, you can safely ignore it.
                </p>
                <p style="color: #666; line-height: 1.5;">
                    Or copy and paste this link into your browser:<br>
                    <span style="color: #4F46E5;">${verificationUrl}</span>
                </p>
            </div>
        `
  };

  await transporter.sendMail(mailOptions);
}

// Send welcome email using template
export const sendWelcomeEmail = async ({ to, name }) => {
  try {
    const result = await sendEmail({
      to,
      from: '"BGH Welcome" <welcome@bgh-hotel.com>',
      subject: 'Welcome to Best Garden Hotel!',
      html: getWelcomeEmailTemplate({ name })
    });

    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send reservation confirmation email using template
export const sendReservationEmail = async ({
  to,
  name,
  roomType,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  reservationId,
  specialRequests
}) => {
  try {
    const result = await sendEmail({
      to,
      from: '"BGH Reservations" <reservations@bgh-hotel.com>',
      subject: 'Your Reservation is Confirmed - Best Garden Hotel',
      html: getReservationConfirmationTemplate({
        name,
        roomType,
        checkIn,
        checkOut,
        guests,
        totalPrice,
        reservationId,
        specialRequests
      })
    });

    return result;
  } catch (error) {
    console.error('Error sending reservation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send password reset email using template
export const sendPasswordResetEmail = async ({ to, token, name }) => {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

    const result = await sendEmail({
      to,
      from: '"BGH Support" <support@bgh-hotel.com>',
      subject: 'Reset Your Password - Best Garden Hotel',
      html: getPasswordResetTemplate({
        name,
        resetUrl
      })
    });

    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 