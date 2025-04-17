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
        room: true
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
    await sendEmail({
      to: reservation.email,
      subject: 'Reservation Cancellation Confirmation',
      html: `
        <h1>Reservation Cancellation Confirmation</h1>
        <p>Your reservation has been cancelled successfully.</p>
        <h2>Reservation Details:</h2>
        <ul>
          <li>Reservation ID: ${reservation.id}</li>
          <li>Room: ${reservation.room.name}</li>
          <li>Check-in: ${reservation.checkInDate}</li>
          <li>Check-out: ${reservation.checkOutDate}</li>
          <li>Cancellation Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p>If you have any questions, please contact our support team.</p>
      `
    });

    return res.status(200).json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return res.status(500).json({ message: 'Error cancelling reservation' });
  }
} 