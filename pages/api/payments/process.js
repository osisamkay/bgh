import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Store processed payment IDs to prevent double payments
const processedPayments = new Set();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const paymentData = await req.json();

    // Validate payment data
    if (!paymentData.reservationId || !paymentData.paymentIntentId) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      );
    }

    // Check for duplicate payment attempts
    if (processedPayments.has(paymentData.reservationId)) {
      return NextResponse.json(
        { error: 'Payment already processed for this reservation' },
        { status: 400 }
      );
    }

    // Verify the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentData.paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Update reservation status
    const updatedReservation = await prisma.booking.update({
      where: { id: paymentData.reservationId },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentIntentId: paymentData.paymentIntentId,
        paymentDate: new Date()
      },
      include: {
        room: true,
        user: true
      }
    });

    // Send confirmation email
    // TODO: Implement email sending

    // Mark this payment as processed
    processedPayments.add(paymentData.reservationId);

    return NextResponse.json({
      status: 'succeeded',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
} 