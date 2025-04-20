import { prisma } from '@/lib/prisma';
import { sendReservationEmail } from '../../utils/emailService';
import { useNotification } from '../../contexts/NotificationContext';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);

  if (req.method === 'GET') {
    try {
      const reservations = await prisma.booking.findMany({
        include: {
          user: true,
          room: true,
          checkInDetails: true,
          checkOutDetails: true,
          payment: true,
          refund: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        fullName,
        email,
        phone,
        specialRequests,
        id,
        termsAccepted,
        checkInDate,
        checkOutDate,
        numberOfGuests
      } = req.body;

      // Validate required fields with specific messages
      const missingFields = [];
      if (!fullName) missingFields.push('Full Name');
      if (!email) missingFields.push('Email');
      if (!phone) missingFields.push('Phone Number');
      if (!id) missingFields.push('Room ID');
      if (!termsAccepted) missingFields.push('Terms and Conditions');
      if (!checkInDate) missingFields.push('Check-in Date');
      if (!checkOutDate) missingFields.push('Check-out Date');
      if (!numberOfGuests) missingFields.push('Number of Guests');

      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: `Please provide: ${missingFields.join(', ')}`
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format',
          details: 'Please enter a valid email address'
        });
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          error: 'Invalid phone number format',
          details: 'Please enter a valid phone number with at least 10 digits'
        });
      }

      // Find room
      const room = await prisma.room.findUnique({
        where: { id: String(id) }
      });

      if (!room) {
        return res.status(404).json({ 
          error: 'Room not found',
          details: 'The selected room is no longer available'
        });
      }

      // Check if user exists with this email
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      // If user doesn't exist, create a temporary user
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: fullName,
            email: email.toLowerCase(),
            password: 'temporary',
            streetAddress: '',
            city: '',
            postalCode: '',
            province: '',
            country: '',
            termsAccepted: true,
            role: 'GUEST',
            firstName: fullName.split(' ')[0] || '',
            lastName: fullName.split(' ').slice(1).join(' ') || ''
          }
        });
      }

      // Calculate total price
      const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
      const totalPrice = room.price * nights;

      // Create reservation
      const reservation = await prisma.booking.create({
        data: {
          userId: user.id,
          roomId: room.id,
          checkInDate: new Date(checkInDate),
          checkOutDate: new Date(checkOutDate),
          numberOfGuests: parseInt(numberOfGuests, 10),
          specialRequests,
          status: 'PENDING',
          totalPrice,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: true,
          room: true
        }
      });

      // Send confirmation email and get preview URL
      let emailPreviewUrl = null;
      try {
        const emailResult = await sendReservationEmail({
          to: email.toLowerCase(),
          name: fullName,
          roomType: room.type,
          checkIn: new Date(checkInDate),
          checkOut: new Date(checkOutDate),
          guests: parseInt(numberOfGuests, 10),
          totalPrice: totalPrice,
          reservationId: reservation.id,
          specialRequests: specialRequests || ''
        });
        emailPreviewUrl = emailResult.previewUrl;
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // Don't fail the reservation if email fails
      }

      return res.status(200).json({
        message: 'Reservation created successfully',
        details: 'Your reservation has been confirmed.',
        reservation,
        emailPreviewUrl
      });
    } catch (error) {
      console.error('Reservation error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: 'An unexpected error occurred. Please try again later.'
      });
    }
  }

  return res.status(405).json({ 
    error: 'Method not allowed',
    details: 'Only GET and POST requests are allowed'
  });
} 