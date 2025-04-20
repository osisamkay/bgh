import { verifyToken } from '../../utils/auth';
import { prisma } from '../../lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Request body:', req.body);

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

        // Verify reservation exists and belongs to user
        const reservation = await prisma.booking.findFirst({
            where: {
                id: reservationId,
                userId: decoded.userId
            },
            include: {
                room: true,
                user: true
            }
        });

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        // Convert amount to cents and ensure it's an integer
        const amountInCents = Math.round(amount * 100);

        console.log('Creating payment intent:', {
            amountInCents,
            currency: 'usd',
            reservationId,
            userId: decoded.userId
        });

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: {
                reservationId,
                userId: decoded.userId
            },
            automatic_payment_methods: {
                enabled: true
            }
        });

        console.log('Payment intent created:', paymentIntent.id);

        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            type: error.type,
            code: error.code,
            param: error.param
        });

        // Send more specific error messages
        if (error.type === 'StripeError') {
            return res.status(400).json({ error: `Stripe error: ${error.message}` });
        }

        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Database constraint violation' });
        }

        res.status(500).json({ error: `Payment intent creation failed: ${error.message}` });
    }
} 