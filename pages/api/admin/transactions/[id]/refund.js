// pages/api/admin/transactions/[id]/refund.js
import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import Stripe from 'stripe';

export default async function handler(req, res) {
    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Get payment ID from URL
        const { id } = req.query;

        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token and get user
        const user = await verifyToken(token);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Get request body
        const { amount, reason } = req.body;

        if (!amount || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Amount and reason are required'
            });
        }

        // Find the payment to refund
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

        if (payment.status !== 'COMPLETED' && payment.status !== 'SUCCEEDED') {
            return res.status(400).json({
                success: false,
                message: 'Only completed payments can be refunded'
            });
        }

        if (amount > payment.amount) {
            return res.status(400).json({
                success: false,
                message: 'Refund amount cannot exceed payment amount'
            });
        }

        // Initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Process refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment.paymentIntentId,
            amount: Math.round(amount * 100), // Convert to cents
            reason: 'requested_by_customer'
        });

        // Create refund record in database
        const refundRecord = await prisma.refund.create({
            data: {
                bookingId: payment.bookingId,
                userId: payment.userId,
                amount: parseFloat(amount),
                reason,
                status: 'COMPLETED'
            }
        });

        // Update booking status if it's a full refund
        if (parseFloat(amount) === payment.amount) {
            await prisma.booking.update({
                where: { id: payment.bookingId },
                data: { status: 'CANCELLED' }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: refundRecord
        });

    } catch (error) {
        console.error('Error processing refund:', error);
        
        // Handle Stripe specific errors
        if (error.type === 'StripeInvalidRequestError') {
            return res.status(400).json({
                success: false,
                message: error.message || 'Invalid refund request',
                error: error.message
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
}