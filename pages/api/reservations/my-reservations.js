import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const user = await verifyToken(token);
        if (!user || !user.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Get user's reservations
        const reservations = await prisma.booking.findMany({
            where: {
                userId: user.id,
            },
            include: {
                room: {
                    select: {
                        roomNumber: true,
                        type: true,
                        price: true,
                        images: true,
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
                name: reservation.room.roomNumber,
                type: reservation.room.type,
                image: reservation.room.images?.[0] || null,
                pricePerNight: reservation.room.price,
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
            message: 'Failed to fetch reservations',
            error: error.message
        });
    } finally {
        await prisma.$disconnect();
    }
} 