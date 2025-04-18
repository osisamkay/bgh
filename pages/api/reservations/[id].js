import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';
import { RefundService } from '@/utils/refundService';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
  const { id } = req.query;
  const token = req.headers.authorization?.split(' ')[1];
  const user = token ? await verifyToken(token) : null;

  try {
    switch (req.method) {
      case 'GET':
        const reservation = await prisma.booking.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                name: true,
                streetAddress: true,
                city: true,
                postalCode: true,
                province: true,
                country: true
              }
            },
            room: true,
            checkInDetails: true,
            checkOutDetails: true,
            payment: true,
            refund: true
          }
        });

        if (!reservation) {
          return res.status(404).json({ error: 'Reservation not found' });
        }

        // If user is authenticated and is either the reservation owner or staff/admin
        if (user && (user.id === reservation.userId || user.role === 'FRONT_DESK' || user.role === 'ADMIN')) {
          return res.status(200).json(reservation);
        }

        // Format dates to ISO string
        const formattedReservation = {
          id: reservation.id,
          checkInDate: new Date(reservation.checkInDate).toISOString(),
          checkOutDate: new Date(reservation.checkOutDate).toISOString(),
          numberOfGuests: reservation.numberOfGuests,
          status: reservation.status,
          totalPrice: reservation.totalPrice,
          specialRequests: reservation.specialRequests,
          user: reservation.user
        };

        // Handle room data safely
        if (reservation.room) {
          formattedReservation.room = {
            id: reservation.room.id,
            type: reservation.room.type || 'Unknown',
            price: reservation.room.price || 0,
            description: reservation.room.description || '',
            amenities: Array.isArray(reservation.room.amenities) 
              ? reservation.room.amenities 
              : typeof reservation.room.amenities === 'string'
                ? JSON.parse(reservation.room.amenities)
                : [],
            images: Array.isArray(reservation.room.images)
              ? reservation.room.images
              : typeof reservation.room.images === 'string'
                ? JSON.parse(reservation.room.images)
                : []
          };
        } else {
          formattedReservation.room = {
            type: 'Unknown Room Type',
            price: 0,
            description: '',
            amenities: [],
            images: []
          };
        }

        return res.status(200).json(formattedReservation);

      case 'PUT':
        if (!user || (user.role !== 'FRONT_DESK' && user.role !== 'ADMIN')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
          roomType,
          checkInDate,
          checkOutDate,
          numberOfGuests,
          staffId
        } = req.body;

        const existingReservation = await prisma.booking.findUnique({
          where: { id },
          include: {
            user: true,
            room: true
          }
        });

        if (!existingReservation) {
          return res.status(404).json({ error: 'Reservation not found' });
        }

        if (existingReservation.status === 'CHECKED_IN' || existingReservation.status === 'CHECKED_OUT') {
          return res.status(400).json({ error: 'Cannot modify completed reservation' });
        }

        // Find available rooms for the new dates
        const availableRooms = await prisma.room.findMany({
          where: {
            type: roomType,
            status: 'AVAILABLE',
            bookings: {
              none: {
                OR: [
                  {
                    checkInDate: { lte: new Date(checkOutDate) },
                    checkOutDate: { gte: new Date(checkInDate) },
                    status: { not: 'CANCELLED' },
                    id: { not: id }
                  }
                ]
              }
            }
          },
          take: 1
        });

        if (availableRooms.length === 0) {
          return res.status(400).json({ error: 'No rooms available for the selected dates' });
        }

        const newRoom = availableRooms[0];
        const newPrice = newRoom.price * Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));

        // Update reservation
        const updatedReservation = await prisma.booking.update({
          where: { id },
          data: {
            roomId: newRoom.id,
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            numberOfGuests,
            totalPrice: newPrice,
            updatedAt: new Date()
          },
          include: {
            user: true,
            room: true
          }
        });

        // Send update email
        await sendEmail({
          to: existingReservation.user.email,
          subject: 'Reservation Updated',
          html: `
            <h2>Reservation Update</h2>
            <p>Dear ${existingReservation.user.firstName},</p>
            <p>Your reservation has been updated.</p>
            <h3>Updated Details:</h3>
            <ul>
              <li>Room Type: ${roomType}</li>
              <li>Check-in Date: ${new Date(checkInDate).toLocaleDateString()}</li>
              <li>Check-out Date: ${new Date(checkOutDate).toLocaleDateString()}</li>
              <li>Number of Guests: ${numberOfGuests}</li>
              <li>Total Price: $${newPrice}</li>
            </ul>
          `
        });

        // Log modification
        await prisma.employeeLog.create({
          data: {
            type: 'RESERVATION_MODIFIED',
            userId: staffId,
            userName: user.name,
            timestamp: new Date(),
            details: JSON.stringify({
              reservationId: id,
              changes: {
                roomType,
                checkInDate,
                checkOutDate,
                numberOfGuests,
                price: newPrice
              }
            })
          }
        });

        return res.status(200).json({
          success: true,
          reservation: updatedReservation
        });

      case 'DELETE':
        if (!user || (user.role !== 'FRONT_DESK' && user.role !== 'ADMIN')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const reservationToDelete = await prisma.booking.findUnique({
          where: { id },
          include: {
            user: true,
            room: true,
            payment: true
          }
        });

        if (!reservationToDelete) {
          return res.status(404).json({ error: 'Reservation not found' });
        }

        if (reservationToDelete.status === 'CHECKED_IN' || reservationToDelete.status === 'CHECKED_OUT') {
          return res.status(400).json({ error: 'Cannot cancel completed reservation' });
        }

        // Process refund if payment exists
        if (reservationToDelete.payment) {
          await RefundService.processRefund(
            id,
            reservationToDelete.userId,
            {
              amount: reservationToDelete.payment.amount,
              paymentMethod: reservationToDelete.payment.method,
              reason: 'Reservation cancelled by staff'
            }
          );
        }

        // Update reservation status
        await prisma.booking.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });

        // Send cancellation email
        await sendEmail({
          to: reservationToDelete.user.email,
          subject: 'Reservation Cancelled',
          html: `
            <h2>Reservation Cancelled</h2>
            <p>Dear ${reservationToDelete.user.firstName},</p>
            <p>Your reservation has been cancelled.</p>
            <p>If you have made a payment, a refund will be processed according to our cancellation policy.</p>
          `
        });

        // Log cancellation
        await prisma.employeeLog.create({
          data: {
            type: 'RESERVATION_CANCELLED',
            userId: user.id,
            userName: user.name,
            timestamp: new Date(),
            details: JSON.stringify({
              reservationId: id,
              userId: reservationToDelete.userId
            })
          }
        });

        return res.status(200).json({
          success: true,
          message: 'Reservation cancelled successfully'
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Error in ${req.method} reservation:`, error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
