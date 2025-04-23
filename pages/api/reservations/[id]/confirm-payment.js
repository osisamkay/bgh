import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        let userId;

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { id } = req.query;
        const { status, paymentAmount, paymentDetails } = req.body;

        // Validate required fields
        if (!status || paymentAmount === undefined || !paymentDetails) {
            return res.status(400).json({
                error: 'Missing required fields',
                received: {
                    status,
                    paymentAmount,
                    paymentDetails
                }
            });
        }

        // Find the booking
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!booking || booking.userId !== userId) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Generate unique payment intent ID
        const paymentIntentId = `pi_${uuidv4()}`;

        // Create payment record following the schema
        const payment = await prisma.payment.create({
            data: {
                amount: paymentAmount,
                paymentIntentId: paymentIntentId,
                status: status,
                paymentMethod: paymentDetails.cardType,
                paymentDate: new Date(),
                booking: {
                    connect: { id: id }
                },
                user: {
                    connect: { id: userId }
                }
            }
        });

        // Update booking status
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: status,
                totalPrice: paymentAmount,
                metadata: JSON.stringify({
                    paymentMethod: paymentDetails.cardType,
                    paymentDetails: paymentDetails
                }),
                updatedAt: new Date()
            },
            include: {
                user: true,
                payment: true
            }
        });

        // Send confirmation email
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email/confirmation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId: id,
                    email: updatedBooking.user.email
                })
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        return res.status(200).json({
            message: 'Payment confirmed successfully',
            booking: updatedBooking,
            payment: payment
        });
    } catch (error) {
        console.error('Payment confirmation error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 