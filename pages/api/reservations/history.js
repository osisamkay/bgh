import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication token is required' });
        }

        const user = await verifyToken(token);
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { page = 1, limit = 10, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {
            userId: user.id
        };

        if (status) {
            where.status = status;
        }

        // Get bookings with pagination
        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                include: {
                    room: true,
                    payment: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.booking.count({ where })
        ]);

        // Calculate booking statistics
        const stats = await prisma.booking.groupBy({
            by: ['status'],
            where: {
                userId: user.id
            },
            _count: {
                status: true
            }
        });

        return res.status(200).json({
            bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            stats: stats.reduce((acc, curr) => {
                acc[curr.status] = curr._count.status;
                return acc;
            }, {})
        });
    } catch (error) {
        console.error('Error fetching booking history:', error);
        return res.status(500).json({ error: 'Failed to fetch booking history' });
    } finally {
        await prisma.$disconnect();
    }
} 