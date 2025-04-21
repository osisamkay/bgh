import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    // Get booking ID from URL
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Booking ID is required'
        });
    }

    // Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }

    // Verify admin role
    if (user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    // Handle different HTTP methods
    switch (req.method) {
        case 'GET':
            return getBooking(req, res, id);
        case 'PUT':
            return updateBooking(req, res, id);
        case 'DELETE':
            return deleteBooking(req, res, id);
        default:
            return res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
    }
}

// Get a single booking
async function getBooking(req, res, id) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
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
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
}

// Update a booking
async function updateBooking(req, res, id) {
    try {
        const { status, ...otherData } = req.body;

        // Check if booking exists
        const booking = await prisma.booking.findUnique({
            where: { id }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status,
                ...otherData
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating booking',
            error: error.message
        });
    }
}

// Delete a booking
async function deleteBooking(req, res, id) {
    try {
        // Check if booking exists
        const booking = await prisma.booking.findUnique({
            where: { id }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Delete booking
        await prisma.booking.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting booking',
            error: error.message
        });
    }
}