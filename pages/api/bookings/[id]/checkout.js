import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'FRONT_DESK') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch booking and related details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        room: true,
        checkInDetails: true,
        charges: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      booking,
      charges: booking.charges
    });
  } catch (error) {
    console.error('Error fetching checkout details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checkout details' },
      { status: 500 }
    );
  }
}

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
    const checkoutData = await req.json();

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        room: true,
        checkInDetails: true,
        charges: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Handle disputed charges
    if (checkoutData.disputedCharges && checkoutData.disputedCharges.length > 0) {
      await prisma.chargeDispute.create({
        data: {
          bookingId: id,
          notes: checkoutData.disputeNotes,
          disputedBy: session.user.id,
          disputedAt: new Date(),
          charges: {
            connect: checkoutData.disputedCharges.map(chargeId => ({ id: chargeId }))
          }
        }
      });

      // Update disputed charges status
      await prisma.charge.updateMany({
        where: {
          id: {
            in: checkoutData.disputedCharges
          }
        },
        data: {
          status: 'DISPUTED'
        }
      });
    }

    // Process payment for undisputed charges
    if (checkoutData.paymentMethod && checkoutData.amountPaid > 0) {
      await prisma.payment.create({
        data: {
          bookingId: id,
          method: checkoutData.paymentMethod,
          amount: checkoutData.amountPaid,
          status: 'COMPLETED',
          details: JSON.stringify({
            processedBy: session.user.id,
            processedAt: new Date()
          })
        }
      });
    }

    // Update booking status and add check-out details
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CHECKED_OUT',
        checkOutDetails: {
          create: {
            checkedOutBy: session.user.id,
            checkedOutAt: new Date(),
            keyReturned: checkoutData.keyReturned,
            feedback: checkoutData.feedback
          }
        },
        room: {
          update: {
            status: checkoutData.keyReturned ? 'AVAILABLE' : 'MAINTENANCE_NEEDED'
          }
        }
      },
      include: {
        user: true,
        room: true,
        checkOutDetails: true
      }
    });

    // Log check-out in employee dashboard
    await prisma.employeeLog.create({
      data: {
        type: 'CHECK_OUT',
        userId: session.user.id,
        userName: session.user.name,
        timestamp: new Date(),
        details: JSON.stringify({
          bookingId: id,
          roomNumber: booking.checkInDetails.roomNumber,
          paymentStatus: checkoutData.paymentMethod ? 'PAID' : 'PENDING',
          keyReturned: checkoutData.keyReturned,
          disputedCharges: checkoutData.disputedCharges?.length || 0
        })
      }
    });

    // Send check-out confirmation email
    await sendEmail({
      to: booking.user.email,
      subject: 'Check-out Confirmation',
      html: `
        <h2>Check-out Confirmation</h2>
        <p>Dear ${booking.user.firstName},</p>
        <p>Your check-out has been successfully processed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li>Booking ID: ${booking.id}</li>
          <li>Room Number: ${booking.checkInDetails.roomNumber}</li>
          <li>Check-out Date: ${new Date().toLocaleDateString()}</li>
        </ul>
        ${checkoutData.feedback ? `
          <h3>Thank you for your feedback!</h3>
          <p>We appreciate you taking the time to share your experience with us.</p>
        ` : ''}
        <p>We hope you enjoyed your stay and look forward to welcoming you back soon!</p>
      `
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Check-out failed' },
      { status: 500 }
    );
  }
} 