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

        // Verify token
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

        // Get query parameters for filtering and pagination
        const { search, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause for searching
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get users with pagination
        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            bookings: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.user.count({ where })
        ]);

        // Format response
        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified,
            bookingsCount: user._count.bookings,
            createdAt: user.createdAt
        }));

        return res.status(200).json({
            success: true,
            data: formattedUsers,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
}