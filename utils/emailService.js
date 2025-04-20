// utils/emailService.js
import nodemailer from 'nodemailer';

// Create transporter based on environment
const getTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email settings
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development/testing email settings with preview
    return nodemailer.createTransport({
      host: process.env.TEST_SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.TEST_SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.TEST_EMAIL_USER,
        pass: process.env.TEST_EMAIL_PASS
      }
    });
  }
};

// Function to construct the full URL
const getAppUrl = (path) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
};

// Send verification email
export const sendVerificationEmail = async ({ to, token, name }) => {
  try {
    const transporter = getTransporter();
    const verificationUrl = getAppUrl(`/verify-email?token=${token}`);

    const mailOptions = {
      from: process.env.SMTP_FROM || '"BGH Support" <support@bgh.com>',
      to,
      subject: 'Verify your email address - Best Garden Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2b3b;">Welcome to Best Garden Hotel!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1a2b3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account with us, please ignore this email.</p>
          <p>Best regards,<br>The Best Garden Hotel Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async ({ to, name }) => {
  try {
    const transporter = getTransporter();
    const loginUrl = getAppUrl('/login');

    const mailOptions = {
      from: process.env.SMTP_FROM || '"BGH Support" <support@bgh.com>',
      to,
      subject: 'Welcome to Best Garden Hotel!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2b3b;">Thank You for Joining Best Garden Hotel!</h2>
          <p>Hello ${name},</p>
          <p>Your email has been successfully verified. Welcome to the Best Garden Hotel family!</p>
          <p>You can now access all features of our website, including:</p>
          <ul>
            <li>Booking luxurious rooms at special member rates</li>
            <li>Managing your reservations</li>
            <li>Accessing exclusive offers and promotions</li>
            <li>Saving your preferences for future stays</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #1a2b3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Log In to Your Account</a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>
          <p>We look forward to welcoming you soon!</p>
          <p>Best regards,<br>The Best Garden Hotel Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async ({ to, token, name }) => {
  try {
    const transporter = getTransporter();
    const resetUrl = getAppUrl(`/reset-password?token=${token}`);

    const mailOptions = {
      from: process.env.SMTP_FROM || '"BGH Support" <support@bgh.com>',
      to,
      subject: 'Reset Your Password - Best Garden Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2b3b;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1a2b3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email or contact us if you have concerns.</p>
          <p>Best regards,<br>The Best Garden Hotel Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send reservation confirmation email
export const sendReservationConfirmationEmail = async ({ to, name, bookingDetails }) => {
  try {
    const transporter = getTransporter();
    const bookingUrl = getAppUrl(`/my-reservations`);
    const { bookingId, roomType, checkInDate, checkOutDate, totalPrice } = bookingDetails;

    const formattedCheckIn = new Date(checkInDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedCheckOut = new Date(checkOutDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"BGH Reservations" <reservations@bgh.com>',
      to,
      subject: 'Your Reservation Confirmation - Best Garden Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2b3b;">Your Reservation is Confirmed!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for choosing Best Garden Hotel for your upcoming stay. Your reservation has been confirmed.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #1a2b3b; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking Reference:</strong> ${bookingId}</p>
            <p><strong>Room Type:</strong> ${roomType}</p>
            <p><strong>Check-in:</strong> ${formattedCheckIn} (from 3:00 PM)</p>
            <p><strong>Check-out:</strong> ${formattedCheckOut} (until 12:00 PM)</p>
            <p><strong>Total Amount:</strong> ${totalPrice.toFixed(2)}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${bookingUrl}" style="background-color: #1a2b3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Your Reservation</a>
          </div>
          
          <h3 style="color: #1a2b3b;">Important Information</h3>
          <ul>
            <li>Check-in time is from 3:00 PM. Early check-in may be available upon request.</li>
            <li>Check-out time is until 12:00 PM. Late check-out may incur additional charges.</li>
            <li>Please present a valid ID and the credit card used for booking upon check-in.</li>
            <li>Free Wi-Fi is available throughout the hotel.</li>
            <li>Breakfast is served from 6:30 AM to 10:30 AM in our dining area.</li>
          </ul>
          
          <p>If you need to modify or cancel your reservation, please visit your account on our website or contact us directly.</p>
          <p>We look forward to welcoming you to Best Garden Hotel!</p>
          <p>Best regards,<br>The Best Garden Hotel Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending reservation confirmation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};