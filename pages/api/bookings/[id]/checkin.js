import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'FRONT_DESK') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const checkInData = await req.json();

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        room: true,
        payment: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Process payment if needed
    if (checkInData.paymentMethod && checkInData.amountPaid > 0) {
      await prisma.payment.create({
        data: {
          bookingId: id,
          method: checkInData.paymentMethod,
          amount: checkInData.amountPaid,
          status: 'COMPLETED',
          details: JSON.stringify({
            processedBy: session.user.id,
            processedAt: new Date()
          })
        }
      });
    }

    // Update booking status and add check-in details
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CHECKED_IN',
        checkInDetails: {
          create: {
            roomNumber: checkInData.roomNumber,
            idType: checkInData.idType,
            idNumber: checkInData.idNumber,
            specialRequests: checkInData.specialRequests,
            checkedInBy: session.user.id,
            checkedInAt: new Date()
          }
        }
      },
      include: {
        user: true,
        room: true,
        checkInDetails: true
      }
    });

    // Log check-in in employee dashboard
    await prisma.employeeLog.create({
      data: {
        type: 'CHECK_IN',
        userId: session.user.id,
        userName: session.user.name,
        timestamp: new Date(),
        details: JSON.stringify({
          bookingId: id,
          roomNumber: checkInData.roomNumber,
          paymentStatus: checkInData.paymentMethod ? 'PAID' : 'PENDING',
          specialRequests: checkInData.specialRequests
        })
      }
    });

    // Send confirmation email
    await sendEmail({
      to: booking.user.email,
      subject: 'Check-in Confirmation',
      html: `
        <h2>Check-in Confirmation</h2>
        <p>Dear ${booking.user.firstName},</p>
        <p>Your check-in has been successfully processed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li>Booking ID: ${booking.id}</li>
          <li>Room Number: ${checkInData.roomNumber}</li>
          <li>Room Type: ${booking.room.type}</li>
          <li>Check-in Date: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
          <li>Check-out Date: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>
        </ul>
        <h3>Hotel Amenities:</h3>
        <ul>
          <li>Complimentary Breakfast: 7:00 AM - 10:00 AM</li>
          <li>Free Wi-Fi Access</li>
          <li>24/7 Room Service</li>
          <li>Fitness Center Access</li>
        </ul>
        ${checkInData.specialRequests ? `
          <h3>Special Requests:</h3>
          <p>${checkInData.specialRequests}</p>
        ` : ''}
        <p>If you need any assistance during your stay, please contact the front desk.</p>
      `
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Check-in failed' },
      { status: 500 }
    );
  }
} 