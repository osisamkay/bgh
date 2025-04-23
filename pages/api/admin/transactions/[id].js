// pages/api/admin/transactions/[id].js
import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    // Only allow GET and PUT methods
    if (!['GET', 'PUT'].includes(req.method)) {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Get transaction ID from URL
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

        // Handle GET request - Fetch transaction details
        if (req.method === 'GET') {
            // Try to find payment first
            let transaction = await prisma.payment.findUnique({
                where: { id },
                include: {
                    booking: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });

            let type = 'PAYMENT';

            // If not found, try to find refund
            if (!transaction) {
                transaction = await prisma.refund.findUnique({
                    where: { id },
                    include: {
                        booking: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                });
                type = 'REFUND';

                if (!transaction) {
                    return res.status(404).json({
                        success: false,
                        message: 'Transaction not found'
                    });
                }
            }

            // Format transaction data based on type
            const formattedTransaction = type === 'PAYMENT' 
                ? {
                    id: transaction.id,
                    type: 'PAYMENT',
                    amount: transaction.amount,
                    status: transaction.status,
                    date: transaction.paymentDate,
                    createdAt: transaction.createdAt,
                    updatedAt: transaction.updatedAt,
                    paymentMethod: transaction.paymentMethod,
                    paymentIntentId: transaction.paymentIntentId,
                    booking: transaction.booking,
                    user: {
                        id: transaction.user.id,
                        name: `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`.trim(),
                        email: transaction.user.email
                    }
                }
                : {
                    id: transaction.id,
                    type: 'REFUND',
                    amount: transaction.amount,
                    status: transaction.status,
                    date: transaction.createdAt,
                    createdAt: transaction.createdAt,
                    updatedAt: transaction.updatedAt,
                    reason: transaction.reason,
                    booking: transaction.booking,
                    user: {
                        id: transaction.user.id,
                        name: `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`.trim(),
                        email: transaction.user.email
                    }
                };

            return res.status(200).json({
                success: true,
                data: formattedTransaction
            });
        }

        // Handle PUT request - Update transaction (mainly for updating status)
        if (req.method === 'PUT') {
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            // Try to update payment first
            let transaction = await prisma.payment.findUnique({
                where: { id }
            });

            let updatedTransaction;
            
            if (transaction) {
                // It's a payment
                updatedTransaction = await prisma.payment.update({
                    where: { id },
                    data: { status }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Payment status updated successfully',
                    data: updatedTransaction
                });
            } else {
                // Try to update refund
                transaction = await prisma.refund.findUnique({
                    where: { id }
                });

                if (!transaction) {
                    return res.status(404).json({
                        success: false,
                        message: 'Transaction not found'
                    });
                }

                updatedTransaction = await prisma.refund.update({
                    where: { id },
                    data: { status }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Refund status updated successfully',
                    data: updatedTransaction
                });
            }
        }

    } catch (error) {
        console.error('Error processing transaction request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing transaction request',
            error: error.message
        });
    }
}