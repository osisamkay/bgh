import { sendReservationEmail } from '../../utils/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a test reservation object
    const testReservation = {
      to: 'test@example.com',
      name: 'John Doe',
      roomType: 'Deluxe Suite',
      checkIn: new Date('2024-04-01'),
      checkOut: new Date('2024-04-05'),
      guests: 2,
      totalPrice: 1200.00,
      reservationId: 'TEST-' + Date.now(),
      specialRequests: 'Early check-in requested'
    };

    // Send test email
    const emailResult = await sendReservationEmail(testReservation);
    
    console.log('Ethereal Email Account:', {
      user: emailResult.etherealUser,
      pass: emailResult.etherealPass,
      previewUrl: emailResult.previewUrl
    });

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      emailDetails: {
        previewUrl: emailResult.previewUrl,
        messageId: emailResult.messageId,
        etherealUser: emailResult.etherealUser,
        etherealPass: emailResult.etherealPass
      }
    });
  } catch (error) {
    console.error('Error in test-email endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 