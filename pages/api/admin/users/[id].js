import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    // Get user ID from URL
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required'
        });
    }

    // Authenticate admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const token = authHeader.split(' ')[1];
    const adminUser = await verifyToken(token);

    if (!adminUser) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }

    // Verify admin role
    if (adminUser.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    // Handle different HTTP methods
    switch (req.method) {
        case 'GET':
            return getUser(req, res, id);
        case 'PUT':
            return updateUser(req, res, id);
        case 'DELETE':
            return deleteUser(req, res, id, adminUser.id);
        default:
            return res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
    }
}

// Get a single user
async function getUser(req, res, id) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                phone: true,
                streetAddress: true,
                city: true,
                province: true,
                postalCode: true,
                country: true,
                _count: {
                    select: {
                        bookings: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove sensitive information
        const safeUser = {
            ...user,
            bookingsCount: user._count.bookings
        };
        delete safeUser._count;

        return res.status(200).json({
            success: true,
            data: safeUser
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
}

// Update a user
async function updateUser(req, res, id) {
    try {
        const { role, emailVerified, ...userData } = req.body;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                role,
                emailVerified,
                ...userData,
                // If firstName or lastName changed, update the name field
                ...(userData.firstName || userData.lastName
                    ? { name: `${userData.firstName || user.firstName} ${userData.lastName || user.lastName}` }
                    : {})
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
}

// Delete a user
async function deleteUser(req, res, id, adminId) {
    try {
        // Prevent admin from deleting themselves
        if (id === adminId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own admin account'
            });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if the user has any bookings
        const bookingsCount = await prisma.booking.count({
            where: { userId: id }
        });

        if (bookingsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete user with active bookings. This user has ${bookingsCount} booking(s).`
            });
        }

        // Delete verification tokens if any
        await prisma.verificationToken.deleteMany({
            where: { userId: id }
        });

        // Delete any password reset tokens
        try {
            await prisma.resetPasswordToken.deleteMany({
                where: { userId: id }
            });
        } catch (e) {
            // If the table doesn't exist, ignore this error
            console.log('Note: resetPasswordToken table may not exist');
        }

        // Delete user
        await prisma.user.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
}