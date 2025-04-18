import nodemailer from 'nodemailer';

let testAccount = null;

async function getTestAccount() {
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
    console.log('Created Ethereal test account:', {
      user: testAccount.user,
      pass: testAccount.pass,
      web: 'https://ethereal.email'
    });
  }
  return testAccount;
}

async function createTransporter() {
  // Always use Ethereal for both development and production
  const testAccount = await getTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendReservationEmail(reservation) {
  const transporter = await createTransporter();

  const formattedCheckIn = new Date(reservation.checkInDate).toLocaleDateString();
  const formattedCheckOut = new Date(reservation.checkOutDate).toLocaleDateString();

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reservation Confirmation</h2>
      <p>Dear ${reservation.user.name},</p>
      <p>Your reservation has been confirmed. Here are the details:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Room:</strong> ${reservation.room.type}</p>
        <p><strong>Check-in:</strong> ${formattedCheckIn}</p>
        <p><strong>Check-out:</strong> ${formattedCheckOut}</p>
        <p><strong>Guests:</strong> ${reservation.numberOfGuests}</p>
        <p><strong>Total Price:</strong> $${reservation.totalPrice.toFixed(2)}</p>
      </div>

      ${reservation.specialRequests ? `
        <div style="margin: 20px 0;">
          <h3>Special Requests</h3>
          <p>${reservation.specialRequests}</p>
        </div>
      ` : ''}

      <div style="margin-top: 30px;">
        <p>If you have any questions or need to modify your reservation, please contact us.</p>
        <p>Thank you for choosing our hotel!</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"Hotel Booking" <booking@hotel.com>',
    to: reservation.user.email,
    subject: 'Your Reservation Confirmation',
    html: emailContent,
  };

  const info = await transporter.sendMail(mailOptions);

  // Always return preview URL since we're always using Ethereal
  return {
    success: true,
    previewUrl: nodemailer.getTestMessageUrl(info),
    messageId: info.messageId,
    etherealUser: testAccount.user,
    etherealPass: testAccount.pass
  };
}

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

export async function sendWelcomeEmail(user) {
  const transporter = await createTransporter();

  try {
    const mailOptions = {
      from: '"Hotel Booking" <welcome@hotel.com>',
      to: user.email,
      subject: 'Welcome to Best Garden Hotel!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d3748;">Welcome to Best Garden Hotel!</h2>
          <p>Dear ${user.fullName},</p>
          <p>Thank you for creating an account with us. We're excited to have you on board!</p>
          <p>With your account, you can:</p>
          <ul>
            <li>Book rooms at our hotels</li>
            <li>Manage your reservations</li>
            <li>Receive special offers and discounts</li>
            <li>Save your preferences for future bookings</li>
          </ul>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The Hotel Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
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
}

export async function sendVerificationEmail(email, token) {
  const transporter = await createTransporter();
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: '"Hotel Booking" <verify@hotel.com>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Best Garden Hotel!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
        </div>
        <p>If you did not create an account, please ignore this email.</p>
        <p>This verification link will expire in 24 hours.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
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
} 