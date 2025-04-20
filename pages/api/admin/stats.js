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

        // Get total users
        const totalUsers = await prisma.user.count();

        // Get total bookings
        const totalBookings = await prisma.reservation.count();

        // Get total revenue
        const totalRevenue = await prisma.reservation.aggregate({
            where: {
                status: 'CONFIRMED'
            },
            _sum: {
                totalPrice: true
            }
        });

        // Get occupancy rate
        const totalRooms = await prisma.room.count();
        const occupiedRooms = await prisma.reservation.count({
            where: {
                status: 'CONFIRMED',
                checkIn: {
                    lte: new Date()
                },
                checkOut: {
                    gte: new Date()
                }
            }
        });

        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

        return res.status(200).json({
            totalUsers: totalUsers || 0,
            totalBookings: totalBookings || 0,
            totalRevenue: totalRevenue._sum?.totalPrice || 0,
            occupancyRate: Math.round(occupancyRate)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({
            message: 'Error fetching stats',
            error: error.message
        });
    }
} 