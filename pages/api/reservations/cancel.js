import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { sendEmail } from '../../../utils/email';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reservationId, email, reason } = req.body;
    const session = await getServerSession(req, res, authOptions);

    // Find the reservation
    const reservation = await prisma.reservation.findFirst({
      where: {
        OR: [
          { id: reservationId },
          { email: email }
        ],
        status: 'CONFIRMED'
      },
      include: {
        room: true,
        user: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found or already cancelled' });
    }

    // Check if reservation is expired
    const now = new Date();
    const reservationTime = new Date(reservation.createdAt);
    const hoursDiff = (now - reservationTime) / (1000 * 60 * 60);

    if (hoursDiff > 1) {
      return res.status(400).json({ message: 'Reservation has expired' });
    }

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: session?.user?.id || 'GUEST',
        cancellationReason: reason
      }
    });

    // Update room status
    await prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'AVAILABLE' }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CANCELLATION',
        entityType: 'RESERVATION',
        entityId: reservation.id,
        actorId: session?.user?.id || 'GUEST',
        details: {
          reason: reason,
          reservationId: reservation.id,
          email: reservation.email
        }
      }
    });

    // Send cancellation email
    const emailResult = await sendEmail({
      to: reservation.email,
      subject: 'Reservation Cancellation Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Reservation Cancellation Confirmation</h2>
          
          <p>Dear ${reservation.user.name},</p>
          
          <p>This email confirms that your reservation has been cancelled as requested.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0;">Reservation Details:</h3>
            <p><strong>Reservation ID:</strong> ${reservation.id}</p>
            <p><strong>Room:</strong> ${reservation.room.name}</p>
            <p><strong>Check-in:</strong> ${new Date(reservation.checkInDate).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(reservation.checkOutDate).toLocaleDateString()}</p>
            <p><strong>Cancellation Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <p>If you did not request this cancellation or have any questions, please contact our support team immediately.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666;">Best regards,<br>Hotel Team</p>
          </div>
        </div>
      `
    });

    return res.status(200).json({
      message: 'Reservation cancelled successfully',
      reservation: updatedReservation,
      emailDetails: {
        previewUrl: emailResult.previewUrl,
        messageId: emailResult.messageId,
        etherealUser: emailResult.etherealUser,
        etherealPass: emailResult.etherealPass
      }
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return res.status(500).json({ message: 'Error cancelling reservation' });
  }
} 