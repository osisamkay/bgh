import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user's reservations
        const reservations = await prisma.reservation.findMany({
            where: {
                userId: decoded.id,
            },
            include: {
                room: {
                    select: {
                        name: true,
                        type: true,
                        pricePerNight: true,
                        images: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            reservations: reservations.map(reservation => ({
                ...reservation,
                room: {
                    ...reservation.room,
                    // Get the first image as the main image
                    mainImage: reservation.room.images[0] || null
                }
            }))
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        console.error('Error fetching reservations:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching reservations'
        });
    }
} 