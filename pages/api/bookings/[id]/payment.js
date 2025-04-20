import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

export async function POST(req, { params }) {
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
      method,
      amount,
      details,
      staffId
    } = data;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        room: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Payment can only be processed for confirmed bookings' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: params.id,
        method,
        amount,
        status: 'COMPLETED',
        details: JSON.stringify(details),
        processedBy: staffId,
        processedAt: new Date()
      }
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'PAID',
        updatedAt: new Date()
      }
    });

    // Send payment confirmation email
    await sendEmail({
      to: booking.user.email,
      subject: 'Payment Confirmation',
      html: `
        <h2>Payment Confirmation</h2>
        <p>Dear ${booking.user.firstName},</p>
        <p>Your payment has been successfully processed.</p>
        <h3>Payment Details:</h3>
        <ul>
          <li>Booking ID: ${booking.id}</li>
          <li>Amount: $${amount}</li>
          <li>Payment Method: ${method}</li>
          <li>Date: ${new Date().toLocaleDateString()}</li>
        </ul>
        <h3>Booking Details:</h3>
        <ul>
          <li>Room Type: ${booking.room.type}</li>
          <li>Check-in Date: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
          <li>Check-out Date: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>
        </ul>
      `
    });

    // Log payment processing
    await prisma.employeeLog.create({
      data: {
        type: 'PAYMENT_PROCESSED',
        userId: staffId,
        userName: session.user.name,
        timestamp: new Date(),
        details: JSON.stringify({
          bookingId: params.id,
          paymentId: payment.id,
          amount,
          method
        })
      }
    });

    return NextResponse.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 