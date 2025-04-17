import { prisma } from '@/lib/prisma';
import { sendReservationEmail } from '../../utils/emailService';

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
        agreeToTerms,
        checkInDate,
        checkOutDate,
        numberOfGuests
      } = req.body;

      // Validate required fields
      if (!fullName || !email || !phone || !id || !agreeToTerms || !checkInDate || !checkOutDate || !numberOfGuests) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }

      // Find room
      const room = await prisma.room.findUnique({
        where: { 
          id: String(id) // Ensure ID is treated as string
        }
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
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
            phone,
            password: 'temporary', // Will be updated when user sets their password
            streetAddress: '',
            city: '',
            postalCode: '',
            province: '',
            country: '',
            termsAccepted: true,
            role: 'GUEST'
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
          numberOfGuests,
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

      // Send confirmation email
      try {
        await sendReservationEmail(reservation);
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // Don't fail the reservation if email fails
      }

      return res.status(200).json({
        message: 'Reservation created successfully',
        reservation
      });
    } catch (error) {
      console.error('Reservation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 