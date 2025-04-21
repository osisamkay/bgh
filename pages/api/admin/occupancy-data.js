import prisma from '../../../lib/prisma';
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

        // Get total rooms by type
        const totalRoomsByType = await prisma.room.groupBy({
            by: ['type'],
            _count: {
                type: true
            }
        });

        // Get occupied rooms by type
        const occupiedRoomsByType = await prisma.reservation.groupBy({
            by: ['room.type'],
            where: {
                status: 'CONFIRMED',
                checkIn: {
                    lte: new Date()
                },
                checkOut: {
                    gte: new Date()
                }
            },
            _count: {
                roomId: true
            }
        });

        // Format data for pie chart
        const occupancyData = totalRoomsByType.map(roomType => {
            const occupiedCount = occupiedRoomsByType.find(
                occupied => occupied['room.type'] === roomType.type
            )?._count.roomId || 0;

            return {
                name: roomType.type,
                value: Math.round((occupiedCount / roomType._count.type) * 100),
                total: roomType._count.type,
                occupied: occupiedCount
            };
        });

        return res.status(200).json(occupancyData);
    } catch (error) {
        console.error('Error fetching occupancy data:', error);
        return res.status(500).json({ message: 'Error fetching occupancy data' });
    }
} 