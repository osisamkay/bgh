import nodemailer from 'nodemailer';

// Create a test account using Ethereal for development
// In production, you would use real SMTP credentials
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Create transporter for production
const createProductionTransport = () => {
  return nodemailer.createTransport({
    // Configure your email service here
    // Example for Gmail:
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendReservationEmail = async (reservation) => {
  try {
    // Use test account for development
    const transporter = await createTestAccount();
    
    // Format the expiration time
    const expirationTime = new Date(reservation.expiresAt).toLocaleTimeString();
    
    // Create email content
    const mailOptions = {
      from: '"Best Garden Hotel" <reservations@bestgardenhotel.com>',
      to: reservation.email,
      subject: 'Your Reservation at Best Garden Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a2b3b;">Reservation Confirmation</h1>
          
          <p>Dear ${reservation.fullName},</p>
          
          <p>Thank you for choosing Best Garden Hotel. Your reservation details are below:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #1a2b3b; margin-top: 0;">Reservation Details</h2>
            <p><strong>Room Type:</strong> ${reservation.roomType}</p>
            <p><strong>Price:</strong> $${reservation.price} per night</p>
            <p><strong>Reservation ID:</strong> ${reservation.id}</p>
            <p style="color: #dc3545;"><strong>Important:</strong> This reservation will expire at ${expirationTime} if not confirmed.</p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #1a2b3b; margin-top: 0;">Check-in Information</h3>
            <p>Check-in time: 4:00 PM</p>
            <p>Check-out time: 11:00 AM</p>
            <p>Please bring a valid ID and the credit card used for booking.</p>
          </div>

          ${reservation.specialRequests ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #1a2b3b;">Special Requests</h3>
            <p>${reservation.specialRequests}</p>
          </div>
          ` : ''}
          
          <p>If you need to modify or cancel your reservation, please contact us at:</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: support@bestgardenhotel.com</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // For development, log the test email URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendCancellationEmail({ 
  email, 
  reservationId, 
  roomType, 
  checkIn, 
  checkOut, 
  reason,
  guestName 
}) {
  const checkInDate = new Date(checkIn).toLocaleDateString();
  const checkOutDate = new Date(checkOut).toLocaleDateString();

  const emailContent = `
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
        <p style="color: #666;">Best regards,<br>BGH Hotel Team</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Reservation Cancellation Confirmation - ${reservationId}`,
    html: emailContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV === 'development' ? 
        nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 