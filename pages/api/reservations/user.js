import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token and get the user ID
        const decoded = await verifyToken(token);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        // Fetch user's reservations with room details
        const reservations = await prisma.reservation.findMany({
            where: {
                userId: decoded.userId
            },
            include: {
                room: {
                    select: {
                        name: true,
                        type: true,
                        images: true,
                        pricePerNight: true,
                        description: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!reservations) {
            return res.status(200).json({
                success: true,
                reservations: []
            });
        }

        // Format the reservations data
        const formattedReservations = reservations.map(reservation => ({
            id: reservation.id,
            checkIn: reservation.checkInDate,
            checkOut: reservation.checkOutDate,
            numberOfGuests: reservation.numberOfGuests,
            status: reservation.status,
            totalPrice: reservation.totalPrice,
            room: {
                name: reservation.room.name,
                type: reservation.room.type,
                image: reservation.room.images?.[0] || null,
                pricePerNight: reservation.room.pricePerNight,
                description: reservation.room.description
            },
            createdAt: reservation.createdAt
        }));

        return res.status(200).json({
            success: true,
            reservations: formattedReservations
        });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching reservations',
            error: error.message
        });
    }
} 