// Color scheme
const colors = {
  primary: '#1A2A2F',
  secondary: '#C8A750',
  accent: '#2C3F46',
  background: '#F5F4F0',
  white: '#FFFFFF',
  gray: '#666666',
  lightGray: '#E5E5E5',
  success: '#34D399',
  error: '#EF4444',
};

// Common styles
const styles = {
  container: `
    background-color: ${colors.background};
    padding: 40px 20px;
    font-family: 'Arial', sans-serif;
  `,
  card: `
    background-color: ${colors.white};
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 0 auto;
    padding: 40px;
  `,
  logo: `
    text-align: center;
    margin-bottom: 30px;
  `,
  heading: `
    color: ${colors.primary};
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  `,
  text: `
    color: ${colors.gray};
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 20px;
  `,
  button: `
    display: inline-block;
    background-color: ${colors.primary};
    color: ${colors.white};
    padding: 12px 24px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    text-align: center;
    margin: 20px 0;
  `,
  footer: `
    text-align: center;
    color: ${colors.gray};
    font-size: 14px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid ${colors.lightGray};
  `,
  socialLinks: `
    text-align: center;
    margin-top: 20px;
  `,
  socialIcon: `
    display: inline-block;
    margin: 0 10px;
  `,
};

// Header component with logo
const renderHeader = () => `
  <div style="${styles.logo}">
    <img src="https://bgh-hotel.com/logo.png" alt="BGH Logo" style="max-width: 150px;" />
  </div>
`;

// Footer component
const renderFooter = () => `
  <div style="${styles.footer}">
    <p>Best Garden Hotel</p>
    <p style="margin: 10px 0;">123 Garden Street, Cityville, ST 12345</p>
    <div style="${styles.socialLinks}">
      <a href="https://facebook.com/bgh" style="${styles.socialIcon}">
        <img src="https://bgh-hotel.com/social/facebook.png" alt="Facebook" width="24" />
      </a>
      <a href="https://instagram.com/bgh" style="${styles.socialIcon}">
        <img src="https://bgh-hotel.com/social/instagram.png" alt="Instagram" width="24" />
      </a>
      <a href="https://twitter.com/bgh" style="${styles.socialIcon}">
        <img src="https://bgh-hotel.com/social/twitter.png" alt="Twitter" width="24" />
      </a>
    </div>
    <p style="margin-top: 20px; font-size: 12px;">
      © ${new Date().getFullYear()} BGH. All rights reserved.
    </p>
  </div>
`;

// Email verification template
export const getVerificationEmailTemplate = ({ name, verificationUrl }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - BGH</title>
    </head>
    <body style="${styles.container}">
      <div style="${styles.card}">
        ${renderHeader()}
        
        <h1 style="${styles.heading}">Verify Your Email Address</h1>
        
        <p style="${styles.text}">
          Hello ${name},
        </p>
        
        <p style="${styles.text}">
          Welcome to Best Garden Hotel! To complete your registration and access your account, 
          please verify your email address by clicking the button below:
        </p>

        <div style="text-align: center;">
          <a href="${verificationUrl}" style="${styles.button}">
            Verify Email Address
          </a>
        </div>

        <p style="${styles.text}">
          This verification link will expire in 24 hours. If you didn't create an account with us, 
          please ignore this email.
        </p>

        <p style="${styles.text}">
          If you're having trouble clicking the button, copy and paste this URL into your browser:
          <br>
          <a href="${verificationUrl}" style="color: ${colors.primary}; word-break: break-all;">
            ${verificationUrl}
          </a>
        </p>

        ${renderFooter()}
      </div>
    </body>
  </html>
`;

// Welcome email template (sent after verification)
export const getWelcomeEmailTemplate = ({ name }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to BGH - Best Garden Hotel</title>
    </head>
    <body style="${styles.container}">
      <div style="${styles.card}">
        ${renderHeader()}
        
        <h1 style="${styles.heading}">Welcome to Best Garden Hotel!</h1>
        
        <p style="${styles.text}">
          Dear ${name},
        </p>
        
        <p style="${styles.text}">
          Thank you for joining BGH! Your email has been verified, and your account is now active. 
          As a member, you'll enjoy exclusive benefits including:
        </p>

        <ul style="${styles.text}">
          <li>Priority booking</li>
          <li>Special member rates</li>
          <li>Exclusive promotions</li>
          <li>Loyalty rewards</li>
        </ul>

        <div style="text-align: center;">
          <a href="https://bgh-hotel.com/login" style="${styles.button}">
            Log In to Your Account
          </a>
        </div>

        <p style="${styles.text}">
          If you have any questions or need assistance, our support team is here to help 24/7.
        </p>

        ${renderFooter()}
      </div>
    </body>
  </html>
`;

// Reservation confirmation template
export const getReservationConfirmationTemplate = ({
  name,
  roomType,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  reservationId,
  specialRequests
}) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Confirmation - BGH</title>
    </head>
    <body style="${styles.container}">
      <div style="${styles.card}">
        ${renderHeader()}
        
        <h1 style="${styles.heading}">Reservation Confirmed!</h1>
        
        <p style="${styles.text}">
          Dear ${name},
        </p>
        
        <p style="${styles.text}">
          Your reservation at Best Garden Hotel has been confirmed. Here are your booking details:
        </p>

        <div style="background-color: ${colors.background}; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: ${colors.gray};">Reservation ID:</td>
              <td style="padding: 10px 0; color: ${colors.primary}; font-weight: bold;">${reservationId}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: ${colors.gray};">Room Type:</td>
              <td style="padding: 10px 0; color: ${colors.primary};">${roomType}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: ${colors.gray};">Check-in:</td>
              <td style="padding: 10px 0; color: ${colors.primary};">${checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: ${colors.gray};">Check-out:</td>
              <td style="padding: 10px 0; color: ${colors.primary};">${checkOut}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: ${colors.gray};">Guests:</td>
              <td style="padding: 10px 0; color: ${colors.primary};">${guests}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: ${colors.gray};">Total Price:</td>
              <td style="padding: 10px 0; color: ${colors.primary}; font-weight: bold;">$${totalPrice}</td>
            </tr>
            ${specialRequests ? `
              <tr>
                <td style="padding: 10px 0; color: ${colors.gray};">Special Requests:</td>
                <td style="padding: 10px 0; color: ${colors.primary};">${specialRequests}</td>
              </tr>
            ` : ''}
          </table>
        </div>

        <div style="text-align: center;">
          <a href="https://bgh-hotel.com/reservations/${reservationId}" style="${styles.button}">
            View Reservation Details
          </a>
        </div>

        <p style="${styles.text}">
          Need to modify your reservation? You can manage your booking online or contact our 
          front desk at least 24 hours before check-in.
        </p>

        ${renderFooter()}
      </div>
    </body>
  </html>
`;

// Password reset template
export const getPasswordResetTemplate = ({ name, resetUrl }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - BGH</title>
    </head>
    <body style="${styles.container}">
      <div style="${styles.card}">
        ${renderHeader()}
        
        <h1 style="${styles.heading}">Reset Your Password</h1>
        
        <p style="${styles.text}">
          Hello ${name},
        </p>
        
        <p style="${styles.text}">
          We received a request to reset your password. Click the button below to choose a new password:
        </p>

        <div style="text-align: center;">
          <a href="${resetUrl}" style="${styles.button}">
            Reset Password
          </a>
        </div>

        <p style="${styles.text}">
          This password reset link will expire in 1 hour. If you didn't request a password reset, 
          please ignore this email or contact support if you have concerns.
        </p>

        <p style="${styles.text}">
          If you're having trouble clicking the button, copy and paste this URL into your browser:
          <br>
          <a href="${resetUrl}" style="color: ${colors.primary}; word-break: break-all;">
            ${resetUrl}
          </a>
        </p>

        ${renderFooter()}
      </div>
    </body>
  </html>
`;

export const getSubscriptionConfirmationTemplate = ({ email, priceRange, roomType }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #1a2b3b;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e5e7eb;
    }
    .criteria {
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border: 1px solid #e5e7eb;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #6b7280;
      font-size: 0.875rem;
    }
    .button {
      background-color: #d4af37;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Price Alert Subscription Confirmed</h2>
  </div>
  <div class="content">
    <p>Thank you for subscribing to our price alerts! We'll notify you when rooms matching your criteria become available.</p>
    
    <div class="criteria">
      <h3>Your Alert Criteria:</h3>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Price Range:</strong> $${priceRange[0]} - $${priceRange[1]}</li>
        ${roomType ? `<li><strong>Room Type:</strong> ${roomType}</li>` : ''}
      </ul>
    </div>

    <p>You'll receive notifications when:</p>
    <ul>
      <li>Rooms within your price range become available</li>
      <li>Special deals match your criteria</li>
      <li>New rooms matching your preferences are added</li>
    </ul>

    <a href="https://bgh-i2ok92o5y-osisamkays-projects.vercel.app/search" class="button">
      View Available Rooms
    </a>

    <p>You can update your preferences or unsubscribe at any time by visiting your account settings.</p>
  </div>
  
  <div class="footer">
    <p>Best Garden Hotel<br>
    Your comfort is our priority</p>
  </div>
</body>
</html>
`; 