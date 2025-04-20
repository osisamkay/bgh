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

        // Get revenue data for the last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const revenueData = await prisma.reservation.groupBy({
            by: ['checkIn'],
            where: {
                status: 'CONFIRMED',
                checkIn: {
                    gte: twelveMonthsAgo
                }
            },
            _sum: {
                totalPrice: true
            },
            orderBy: {
                checkIn: 'asc'
            }
        });

        // Format the response to ensure consistent data structure
        const formattedRevenueData = revenueData.map(item => ({
            date: item.checkIn.toISOString().split('T')[0],
            revenue: item._sum?.totalPrice || 0
        }));

        return res.status(200).json(formattedRevenueData);
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        return res.status(500).json({
            message: 'Error fetching revenue data',
            error: error.message
        });
    }
} 