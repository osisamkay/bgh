import prisma from '@/lib/prisma';
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

        const { roomType, checkInDate, checkOutDate, numberOfGuests, staffId } = req.body;

        // Validate input
        if (!roomType || !checkInDate || !checkOutDate || !numberOfGuests || !staffId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find existing reservation
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

        // Find new room
        const newRoom = await prisma.room.findFirst({
          where: { type: roomType, status: 'AVAILABLE' }
        });

        if (!newRoom) {
          return res.status(400).json({ error: 'Selected room type not available' });
        }

        // Calculate new price
        const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
        const newPrice = newRoom.price * nights;

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
        const updateEmailResult = await sendEmail({
          to: existingReservation.user.email,
          subject: 'Reservation Updated',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Reservation Update</h2>
              <p>Dear ${existingReservation.user.firstName},</p>
              <p>Your reservation has been updated with the following details:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin-top: 0;">Updated Details:</h3>
                <p><strong>Room Type:</strong> ${roomType}</p>
                <p><strong>Check-in Date:</strong> ${new Date(checkInDate).toLocaleDateString()}</p>
                <p><strong>Check-out Date:</strong> ${new Date(checkOutDate).toLocaleDateString()}</p>
                <p><strong>Number of Guests:</strong> ${numberOfGuests}</p>
                <p><strong>Total Price:</strong> $${newPrice}</p>
              </div>
              
              <p>If you have any questions about these changes, please contact our support team.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666;">Best regards,<br>Hotel Team</p>
              </div>
            </div>
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
          reservation: updatedReservation,
          emailDetails: {
            previewUrl: updateEmailResult.previewUrl,
            messageId: updateEmailResult.messageId,
            etherealUser: updateEmailResult.etherealUser,
            etherealPass: updateEmailResult.etherealPass
          }
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
        const cancelEmailResult = await sendEmail({
          to: reservationToDelete.user.email,
          subject: 'Reservation Cancelled',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Reservation Cancelled</h2>
              <p>Dear ${reservationToDelete.user.firstName},</p>
              <p>Your reservation has been cancelled by our staff.</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin-top: 0;">Reservation Details:</h3>
                <p><strong>Reservation ID:</strong> ${reservationToDelete.id}</p>
                <p><strong>Room:</strong> ${reservationToDelete.room.name}</p>
                <p><strong>Check-in:</strong> ${new Date(reservationToDelete.checkInDate).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(reservationToDelete.checkOutDate).toLocaleDateString()}</p>
                <p><strong>Cancellation Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>If you have made a payment, a refund will be processed according to our cancellation policy.</p>
              <p>If you have any questions, please contact our support team.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666;">Best regards,<br>Hotel Team</p>
              </div>
            </div>
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
          message: 'Reservation cancelled successfully',
          emailDetails: {
            previewUrl: cancelEmailResult.previewUrl,
            messageId: cancelEmailResult.messageId,
            etherealUser: cancelEmailResult.etherealUser,
            etherealPass: cancelEmailResult.etherealPass
          }
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
