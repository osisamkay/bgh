import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token and get user
        const user = await verifyToken(token);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const recentBookings = await prisma.reservation.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                room: {
                    select: {
                        name: true,
                        type: true
                    }
                }
            }
        });

        // Format the response to ensure all fields are present
        const formattedBookings = recentBookings.map(booking => ({
            id: booking.id,
            status: booking.status,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            totalPrice: booking.totalPrice || 0,
            createdAt: booking.createdAt,
            user: {
                firstName: booking.user?.firstName || '',
                lastName: booking.user?.lastName || '',
                email: booking.user?.email || ''
            },
            room: {
                name: booking.room?.name || '',
                type: booking.room?.type || ''
            }
        }));

        return res.status(200).json(formattedBookings);
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        return res.status(500).json({
            message: 'Error fetching recent bookings',
            error: error.message
        });
    }
} 