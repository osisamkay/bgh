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
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
    console.log('Created Ethereal test account:', {
      user: testAccount.user,
      pass: testAccount.pass
    });
  }
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
      pass: account.pass
    }
  });
};

// Format date for email display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Send verification email
export const sendVerificationEmail = async ({ to, token, name }) => {
  try {
    const transporter = await createTransporter();
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email/${token}`;

    const info = await transporter.sendMail({
      from: '"BGH Support" <support@bgh-hotel.com>',
      to,
      subject: 'Verify Your Email - Best Garden Hotel',
      html: getVerificationEmailTemplate({
        name,
        verificationUrl
      })
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      etherealUser: testAccount.user,
      etherealPass: testAccount.pass
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
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: '"BGH Welcome" <welcome@bgh-hotel.com>',
      to,
      subject: 'Welcome to Best Garden Hotel!',
      html: getWelcomeEmailTemplate({ name })
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      etherealUser: testAccount.user,
      etherealPass: testAccount.pass
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send reservation confirmation email
export const sendReservationEmail = async (reservation) => {
  try {
    const transporter = await createTransporter();
    const account = await getTestAccount();

    if (!reservation.to) {
      throw new Error('Recipient email address is required');
    }

    const formattedCheckIn = new Date(reservation.checkIn).toLocaleDateString();
    const formattedCheckOut = new Date(reservation.checkOut).toLocaleDateString();

    const mailOptions = {
      from: `"Hotel Booking" <${account.user}>`,
      to: reservation.to,
      subject: 'Your Hotel Reservation Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Reservation Confirmation</h2>
          <p>Dear ${reservation.name},</p>
          <p>Thank you for choosing our hotel. Your reservation has been confirmed.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Reservation Details</h3>
            <p><strong>Reservation ID:</strong> ${reservation.reservationId}</p>
            <p><strong>Room Type:</strong> ${reservation.roomType}</p>
            <p><strong>Check-in:</strong> ${formattedCheckIn}</p>
            <p><strong>Check-out:</strong> ${formattedCheckOut}</p>
            <p><strong>Number of Guests:</strong> ${reservation.guests}</p>
            <p><strong>Total Price:</strong> $${reservation.totalPrice.toFixed(2)}</p>
            ${reservation.specialRequests ? `<p><strong>Special Requests:</strong> ${reservation.specialRequests}</p>` : ''}
          </div>

          <p>If you have any questions or need to modify your reservation, please don't hesitate to contact us.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      etherealUser: account.user,
      etherealPass: account.pass
    };
  } catch (error) {
    console.error('Error sending reservation email:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async ({ to, token, name }) => {
  try {
    const transporter = await createTransporter();
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

    const info = await transporter.sendMail({
      from: '"BGH Support" <support@bgh-hotel.com>',
      to,
      subject: 'Reset Your Password - Best Garden Hotel',
      html: getPasswordResetTemplate({
        name,
        resetUrl
      })
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      etherealUser: testAccount.user,
      etherealPass: testAccount.pass
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export async function sendCancellationEmail({ 
  email, 
  reservationId, 
  roomType, 
  checkIn, 
  checkOut, 
  reason,
  guestName 
}) {
  const transporter = await createTransporter();
  const checkInDate = new Date(checkIn).toLocaleDateString();
  const checkOutDate = new Date(checkOut).toLocaleDateString();

  const mailOptions = {
    from: '"Hotel Booking" <booking@hotel.com>',
    to: email,
    subject: `Reservation Cancellation Confirmation - ${reservationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Reservation Cancellation Confirmation</h2>
        
        <p>Dear ${guestName},</p>
        
        <p>This email confirms that your reservation has been cancelled as requested.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Reservation Details:</h3>
          <p><strong>Reservation ID:</strong> ${reservationId}</p>
          <p><strong>Room Type:</strong> ${roomType}</p>
          <p><strong>Check-in Date:</strong> ${checkInDate}</p>
          <p><strong>Check-out Date:</strong> ${checkOutDate}</p>
          <p><strong>Cancellation Reason:</strong> ${reason}</p>
        </div>
        
        <p>If you did not request this cancellation or have any questions, please contact our support team immediately.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666;">Best regards,<br>Hotel Team</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      etherealUser: testAccount.user,
      etherealPass: testAccount.pass
    };
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 