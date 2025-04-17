import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';
import { RefundService } from '@/utils/refundService';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'FRONT_DESK' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reservation = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        room: true,
        checkInDetails: true,
        checkOutDetails: true,
        payment: true,
        refund: true
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'FRONT_DESK' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const {
      roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      staffId
    } = data;

    const reservation = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        room: true
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (reservation.status === 'CHECKED_IN' || reservation.status === 'CHECKED_OUT') {
      return NextResponse.json(
        { error: 'Cannot modify completed reservation' },
        { status: 400 }
      );
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
                id: { not: params.id }
              }
            ]
          }
        }
      },
      take: 1
    });

    if (availableRooms.length === 0) {
      return NextResponse.json(
        { error: 'No rooms available for the selected dates' },
        { status: 400 }
      );
    }

    const newRoom = availableRooms[0];
    const newPrice = newRoom.price * Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));

    // Update reservation
    const updatedReservation = await prisma.booking.update({
      where: { id: params.id },
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
      to: reservation.user.email,
      subject: 'Reservation Updated',
      html: `
        <h2>Reservation Update</h2>
        <p>Dear ${reservation.user.firstName},</p>
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
        userName: session.user.name,
        timestamp: new Date(),
        details: JSON.stringify({
          reservationId: params.id,
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

    return NextResponse.json({
      success: true,
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'FRONT_DESK' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reservation = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        room: true,
        payment: true
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (reservation.status === 'CHECKED_IN' || reservation.status === 'CHECKED_OUT') {
      return NextResponse.json(
        { error: 'Cannot cancel completed reservation' },
        { status: 400 }
      );
    }

    // Process refund if payment exists
    if (reservation.payment) {
      await RefundService.processRefund(
        params.id,
        reservation.userId,
        {
          amount: reservation.payment.amount,
          paymentMethod: reservation.payment.method,
          reason: 'Reservation cancelled by staff'
        }
      );
    }

    // Update reservation status
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // Send cancellation email
    await sendEmail({
      to: reservation.user.email,
      subject: 'Reservation Cancelled',
      html: `
        <h2>Reservation Cancelled</h2>
        <p>Dear ${reservation.user.firstName},</p>
        <p>Your reservation has been cancelled.</p>
        <p>If you have made a payment, a refund will be processed according to our cancellation policy.</p>
      `
    });

    // Log cancellation
    await prisma.employeeLog.create({
      data: {
        type: 'RESERVATION_CANCELLED',
        userId: session.user.id,
        userName: session.user.name,
        timestamp: new Date(),
        details: JSON.stringify({
          reservationId: params.id,
          userId: reservation.userId
        })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}
