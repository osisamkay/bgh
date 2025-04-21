import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

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

        // Verify token
        const decoded = await verifyToken(token);
        console.log('Decoded token:', decoded); // Debug log

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Get user profile
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                streetAddress: true,
                city: true,
                province: true,
                postalCode: true,
                country: true,
                customerId: true,
                emailVerified: true,
                emailVerifiedAt: true,
                createdAt: true,
                updatedAt: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Log the user data for debugging
        console.log('Found user:', user);

        return res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            user: user
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({ message: 'Error fetching user profile' });
    }
} 