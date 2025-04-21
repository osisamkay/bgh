import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    // Only allow GET method for fetching bookings
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

        // Get query parameters for filtering
        const { status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause for filtering
        const where = {};

        if (status) {
            where.status = status;
        }

        if (dateFrom || dateTo) {
            where.checkInDate = {};

            if (dateFrom) {
                where.checkInDate.gte = new Date(dateFrom);
            }

            if (dateTo) {
                where.checkInDate.lte = new Date(dateTo);
            }
        }

        // Get bookings with pagination
        const [bookings, totalCount] = await Promise.all([
            prisma.booking.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                skip: skip,
                take: parseInt(limit),
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    room: {
                        select: {
                            id: true,
                            roomNumber: true,
                            type: true
                        }
                    }
                }
            }),
            prisma.booking.count({ where })
        ]);

        // Format bookings data
        const formattedBookings = bookings.map(booking => ({
            id: booking.id,
            guestName: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Guest',
            guestEmail: booking.user?.email,
            roomType: booking.room?.type || 'Standard',
            roomNumber: booking.room?.roomNumber || '',
            checkIn: booking.checkInDate,
            checkOut: booking.checkOutDate,
            status: booking.status,
            totalPrice: booking.totalPrice || 0,
            numberOfGuests: booking.numberOfGuests,
            specialRequests: booking.specialRequests,
            createdAt: booking.createdAt
        }));

        return res.status(200).json({
            success: true,
            data: formattedBookings,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
}