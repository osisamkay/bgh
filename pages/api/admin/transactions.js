// pages/api/admin/transactions.js
import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
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

        // Get query parameters
        const { from, to, type = 'ALL', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};

        if (from || to) {
            where.createdAt = {};

            if (from) {
                where.createdAt.gte = new Date(from);
            }

            if (to) {
                // Set time to end of day
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = endDate;
            }
        }

        if (type !== 'ALL') {
            where.type = type;
        }

        // Get all transactions (payments and refunds)
        const [payments, refunds] = await Promise.all([
            // Get payments
            prisma.payment.findMany({
                where: {
                    ...where,
                    ...(type === 'ALL' || type === 'PAYMENT' ? {} : { id: 'none' }) // Skip if filtering for refunds only
                },
                include: {
                    booking: {
                        select: {
                            id: true,
                            status: true,
                            checkInDate: true,
                            checkOutDate: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),

            // Get refunds
            prisma.refund.findMany({
                where: {
                    ...where,
                    ...(type === 'ALL' || type === 'REFUND' ? {} : { id: 'none' }) // Skip if filtering for payments only
                },
                include: {
                    booking: {
                        select: {
                            id: true,
                            status: true,
                            checkInDate: true,
                            checkOutDate: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        ]);

        // Format payments
        const formattedPayments = payments.map(payment => ({
            id: payment.id,
            type: 'PAYMENT',
            amount: payment.amount,
            status: payment.status,
            date: payment.paymentDate,
            createdAt: payment.createdAt,
            paymentMethod: payment.paymentMethod,
            booking: payment.booking,
            user: {
                id: payment.user.id,
                name: `${payment.user.firstName || ''} ${payment.user.lastName || ''}`.trim(),
                email: payment.user.email
            }
        }));

        // Format refunds
        const formattedRefunds = refunds.map(refund => ({
            id: refund.id,
            type: 'REFUND',
            amount: refund.amount,
            status: refund.status,
            date: refund.createdAt,
            reason: refund.reason,
            booking: refund.booking,
            user: {
                id: refund.user.id,
                name: `${refund.user.firstName || ''} ${refund.user.lastName || ''}`.trim(),
                email: refund.user.email
            }
        }));

        // Combine and sort transactions
        const allTransactions = [...formattedPayments, ...formattedRefunds]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply pagination
        const paginatedTransactions = allTransactions.slice(skip, skip + parseInt(limit));

        // Calculate summary
        const totalPayments = formattedPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalRefunds = formattedRefunds.reduce((sum, r) => sum + r.amount, 0);

        return res.status(200).json({
            success: true,
            data: paginatedTransactions,
            summary: {
                totalPayments,
                totalRefunds
            },
            pagination: {
                total: allTransactions.length,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(allTransactions.length / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching transactions',
            error: error.message
        });
    }
}