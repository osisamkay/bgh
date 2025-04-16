import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, priceRange, roomType } = req.body;

    // Store subscription in database (you would implement this based on your database choice)
    // For now, we'll just send a confirmation email

    // Send confirmation email
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL, // Your verified sender
      subject: 'Hotel Price Alert Subscription Confirmed',
      html: `
        <h2>Thank you for subscribing to price alerts!</h2>
        <p>We'll notify you when rooms matching your criteria become available:</p>
        <ul>
          <li>Price Range: $${priceRange[0]} - $${priceRange[1]}</li>
          ${roomType ? `<li>Room Type: ${roomType}</li>` : ''}
        </ul>
        <p>Best regards,<br>Best Garden Hotel</p>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Error processing subscription' });
  }
} 