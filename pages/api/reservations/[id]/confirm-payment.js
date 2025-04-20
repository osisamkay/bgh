import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify authentication
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No authentication token' });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { id } = req.query;
        const { paymentIntentId, paymentAmount } = req.body;

        // Start a transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Create payment record
            const payment = await prisma.payment.create({
                data: {
                    bookingId: id,
                    userId: decoded.userId,
                    amount: paymentAmount,
                    paymentIntentId: paymentIntentId,
                    status: 'completed',
                    paymentMethod: 'stripe',
                    paymentDate: new Date(),
                }
            });

            // Update booking status
            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    updatedAt: new Date()
                },
                include: {
                    room: true,
                    payment: true
                }
            });

            return { payment, booking: updatedBooking };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
} 