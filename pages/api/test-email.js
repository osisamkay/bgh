import { sendReservationEmail } from '../../utils/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a test reservation object
    const testReservation = {
      user: {
        name: 'Test User',
        email: 'test@example.com'
      },
      room: {
        type: 'Deluxe Suite'
      },
      checkInDate: new Date('2024-04-01'),
      checkOutDate: new Date('2024-04-03'),
      numberOfGuests: 2,
      totalPrice: 299.99,
      specialRequests: 'Early check-in requested'
    };

    // Send test email
    const result = await sendReservationEmail(testReservation);
    
    // Log the Ethereal account details
    console.log('Ethereal Account Details:', {
      user: result.etherealUser,
      pass: result.etherealPass,
      previewUrl: result.previewUrl
    });

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      emailDetails: {
        previewUrl: result.previewUrl,
        messageId: result.messageId,
        etherealUser: result.etherealUser,
        etherealPass: result.etherealPass
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 