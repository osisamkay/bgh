import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';
import { sendEmail } from '@/utils/email';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Cache for payment intents to prevent duplicate charges
const paymentIntentCache = new Map();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication token is required' });
        }

        const user = await verifyToken(token);
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { paymentIntentId, paymentAmount } = req.body;

        if (!paymentIntentId || !paymentAmount) {
            return res.status(400).json({ error: 'Payment details are required' });
        }

        // Check if this payment intent has already been processed
        if (paymentIntentCache.has(paymentIntentId)) {
            return res.status(400).json({ error: 'Payment already processed' });
        }

        const reservation = await prisma.booking.findUnique({
            where: { id },
            include: {
                user: true,
                room: true,
                payment: true
            }
        });

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        if (reservation.userId !== user.id) {
            return res.status(403).json({ error: 'Not authorized to confirm this payment' });
        }

        if (reservation.status === 'confirmed') {
            return res.status(400).json({ error: 'Payment already confirmed' });
        }

        if (reservation.status !== 'pending') {
            return res.status(400).json({ error: 'Invalid reservation status for payment confirmation' });
        }

        // Verify payment with Stripe
        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({ error: 'Payment not successful' });
            }

            if (paymentIntent.amount !== Math.round(paymentAmount * 100)) {
                return res.status(400).json({ error: 'Payment amount mismatch' });
            }
        } catch (error) {
            console.error('Stripe payment verification error:', error);
            return res.status(500).json({ error: 'Failed to verify payment with Stripe' });
        }

        // Use transaction to ensure both payment and reservation updates succeed
        const result = await prisma.$transaction(async (tx) => {
            // Create payment record with status tracking
            const payment = await tx.payment.create({
                data: {
                    amount: paymentAmount,
                    paymentIntentId,
                    status: 'completed',
                    paymentMethod: 'stripe',
                    paymentDate: new Date(),
                    metadata: {
                        stripePaymentIntentId: paymentIntentId,
                        stripeStatus: paymentIntent.status,
                        retryCount: 0
                    },
                    booking: {
                        connect: { id }
                    },
                    user: {
                        connect: { id: user.id }
                    }
                }
            });

            // Update reservation status
            const updatedReservation = await tx.booking.update({
                where: { id },
                data: {
                    status: 'confirmed',
                    paymentId: payment.id,
                    updatedAt: new Date()
                },
                include: {
                    room: true,
                    user: true,
                    payment: true
                }
            });

            return { payment, updatedReservation };
        });

        // Cache the payment intent to prevent duplicate charges
        paymentIntentCache.set(paymentIntentId, {
            timestamp: Date.now(),
            reservationId: id
        });

        // Send confirmation email
        const emailPreviewUrl = await sendEmail({
            to: reservation.user.email,
            subject: 'Payment Confirmation',
            html: `
                <h2>Payment Confirmation</h2>
                <p>Dear ${reservation.user.firstName},</p>
                <p>Your payment has been successfully processed.</p>
                <h3>Payment Details:</h3>
                <ul>
                    <li>Booking ID: ${reservation.id}</li>
                    <li>Amount: $${paymentAmount}</li>
                    <li>Payment Method: Stripe</li>
                    <li>Date: ${new Date().toLocaleDateString()}</li>
                </ul>
                <h3>Booking Details:</h3>
                <ul>
                    <li>Room Type: ${reservation.room.type}</li>
                    <li>Check-in Date: ${new Date(reservation.checkInDate).toLocaleDateString()}</li>
                    <li>Check-out Date: ${new Date(reservation.checkOutDate).toLocaleDateString()}</li>
                </ul>
            `
        });

        return res.status(200).json({
            message: 'Payment confirmed successfully',
            reservation: result.updatedReservation,
            emailDetails: {
                previewUrl: emailPreviewUrl
            }
        });
    } catch (error) {
        console.error('Error confirming payment:', error);

        // If it's a database error, attempt retry
        if (error.code === 'P2002' || error.code === 'P2025') {
            return res.status(409).json({
                error: 'Payment processing conflict. Please try again.',
                retry: true
            });
        }

        return res.status(500).json({ error: 'Failed to confirm payment' });
    } finally {
        await prisma.$disconnect();
    }
} 