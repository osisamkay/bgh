// pages/api/admin/transactions/[id]/refund.js
import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        const { id } = req.query; // Payment ID
        const { amount, reason } = req.body;

        if (!id || !amount || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID, amount, and reason are required'
            });
        }

        // Validate amount is a number
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }

        // Authenticate admin
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];
        const admin = await verifyToken(token);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        if (admin.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Find the payment
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                booking: true
            }
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Validate refund amount doesn't exceed payment amount
        if (parseFloat(amount) > payment.amount) {
            return res.status(400).json({
                success: false,
                message: 'Refund amount cannot exceed payment amount'
            });
        }

        // Check if payment has already been fully refunded
        const existingRefunds = await prisma.refund.findMany({
            where: { bookingId: payment.bookingId }
        });

        const alreadyRefunded = existingRefunds.reduce((sum, refund) => sum + refund.amount, 0);
        const refundableAmount = payment.amount - alreadyRefunded;

        if (parseFloat(amount) > refundableAmount) {
            return res.status(400).json({
                success: false,
                message: `Only $${refundableAmount.toFixed(2)} is available for refund`
            });
        }

        // Create refund record
        const refund = await prisma.refund.create({
            data: {
                bookingId: payment.bookingId,
                userId: payment.userId,
                amount: parseFloat(amount),
                reason,
                status: 'COMPLETED'
            },
            include: {
                booking: true,
                user: true
            }
        });

        // Update booking status if fully refunded
        if (parseFloat(amount) + alreadyRefunded >= payment.amount) {
            await prisma.booking.update({
                where: { id: payment.bookingId },
                data: { status: 'REFUNDED' }
            });
        }

        // In a real application, you would also handle the actual refund with your payment provider here
        // e.g., Stripe refund API call

        return res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                id: refund.id,
                amount: refund.amount,
                reason: refund.reason,
                status: refund.status,
                bookingId: refund.bookingId,
                createdAt: refund.createdAt
            }
        });
    } catch (error) {
        console.error('Error processing refund:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
}