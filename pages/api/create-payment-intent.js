import { verifyToken } from '../../utils/auth';
import prisma from '../../lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify authentication
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { reservationId, amount } = req.body;

        // Validate required fields
        if (!reservationId) {
            return res.status(400).json({ error: 'Reservation ID is required' });
        }

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        if (amount > 999999.99) {
            return res.status(400).json({ error: 'Amount exceeds maximum allowed value' });
        }

        // Verify booking exists and belongs to user
        const booking = await prisma.booking.findFirst({
            where: {
                id: reservationId,
                userId: decoded.userId,
                status: 'PENDING'
            },
            include: {
                room: true,
                user: true
            }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or already paid' });
        }

        // Convert amount to cents and ensure it's an integer
        const amountInCents = Math.round(amount * 100);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'cad',
            metadata: {
                bookingId: reservationId,
                userId: decoded.userId
            },
            automatic_payment_methods: {
                enabled: true
            },
            description: `Payment for booking ${reservationId}`,
            receipt_email: booking.user.email
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);

        if (error.type === 'StripeError') {
            return res.status(400).json({
                error: `Payment processing error: ${error.message}`,
                code: error.code
            });
        }

        res.status(500).json({
            error: 'Failed to create payment intent',
            details: error.message
        });
    }
} 