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

// FIXED FUNCTION: Now accepts object parameter and always returns a value
export async function sendVerificationEmail({ to, token, name }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  // Always log the URL in both development and production for debugging
  console.log('Verification URL:', verificationUrl);
  
  // In development, use the createTransporter function to send mail via Ethereal
  if (process.env.NODE_ENV === 'development') {
    try {
      const result = await sendEmail({
        to,
        subject: 'Verify your email address - Best Garden Hotel',
        html: getVerificationEmailTemplate({ name, verificationUrl })
      });
      
      return result;
    } catch (error) {
      console.error('Error sending verification email via Ethereal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // In production, use the configured SMTP service
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"BGH Support" <support@bestgardenhotel.com>',
      to,
      subject: 'Verify your email address',
      html: getVerificationEmailTemplate({ name, verificationUrl })
    };

    await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: 'production_email'
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: error.message
    };
  }
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