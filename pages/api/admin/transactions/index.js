// pages/api/admin/transactions/index.js
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
        const { from, to, type = 'ALL', page = 1, limit = 20, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause for payments
        const paymentWhere = {};
        const refundWhere = {};

        // Date filter (only if both dates are provided)
        if (from && to) {
            paymentWhere.paymentDate = {};
            refundWhere.createdAt = {};

            paymentWhere.paymentDate.gte = new Date(from);
            refundWhere.createdAt.gte = new Date(from);

            // Set time to end of day
            const endDate = new Date(to);
            endDate.setHours(23, 59, 59, 999);
            paymentWhere.paymentDate.lte = endDate;
            refundWhere.createdAt.lte = endDate;
        }

        // Search filter
        if (search) {
            const searchFilters = {
                OR: [
                    {
                        booking: {
                            id: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        user: {
                            OR: [
                                {
                                    firstName: {
                                        contains: search,
                                        mode: 'insensitive'
                                    }
                                },
                                {
                                    lastName: {
                                        contains: search,
                                        mode: 'insensitive'
                                    }
                                },
                                {
                                    email: {
                                        contains: search,
                                        mode: 'insensitive'
                                    }
                                }
                            ]
                        }
                    }
                ]
            };

            paymentWhere.OR = searchFilters.OR;
            refundWhere.OR = searchFilters.OR;
        }

        // Get payments and refunds based on type filter
        const [payments, refunds, paymentCount, refundCount] = await Promise.all([
            // Get payments
            prisma.payment.findMany({
                where: type === 'ALL' || type === 'PAYMENT' ? paymentWhere : { id: 'none' },
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
                    paymentDate: 'desc'
                },
                skip: type === 'REFUND' ? 0 : skip,
                take: type === 'REFUND' ? 1000 : parseInt(limit) // Get more if we need to combine with refunds
            }),

            // Get refunds
            prisma.refund.findMany({
                where: type === 'ALL' || type === 'REFUND' ? refundWhere : { id: 'none' },
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
                },
                skip: type === 'PAYMENT' ? 0 : skip,
                take: type === 'PAYMENT' ? 1000 : parseInt(limit) // Get more if we need to combine with payments
            }),
            
            // Get total counts for pagination
            prisma.payment.count({
                where: type === 'ALL' || type === 'PAYMENT' ? paymentWhere : { id: 'none' }
            }),
            
            prisma.refund.count({
                where: type === 'ALL' || type === 'REFUND' ? refundWhere : { id: 'none' }
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
            paymentIntentId: payment.paymentIntentId,
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
            createdAt: refund.createdAt,
            reason: refund.reason,
            booking: refund.booking,
            user: {
                id: refund.user.id,
                name: `${refund.user.firstName || ''} ${refund.user.lastName || ''}`.trim(),
                email: refund.user.email
            }
        }));

        // Combine and sort transactions
        let allTransactions = [...formattedPayments, ...formattedRefunds];
        
        // Sort by date, newest first
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Apply pagination if combining both types
        const totalCount = paymentCount + refundCount;
        let paginatedTransactions = allTransactions;
        
        if (type === 'ALL') {
            // For combined results, we need to manually apply pagination after combining
            paginatedTransactions = allTransactions.slice(skip, skip + parseInt(limit));
        }

        // Calculate summary
        const totalPayments = formattedPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalRefunds = formattedRefunds.reduce((sum, r) => sum + r.amount, 0);

        return res.status(200).json({
            success: true,
            data: paginatedTransactions,
            summary: {
                totalPayments,
                totalRefunds,
                netAmount: totalPayments - totalRefunds
            },
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / parseInt(limit))
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