// pages/api/user/update-profile.js
import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const user = await verifyToken(token);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        const {
            firstName, lastName, phone, streetAddress, city,
            province, postalCode, country
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !streetAddress || !city || !province || !postalCode || !country) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                phone: phone || null,
                streetAddress,
                city,
                province,
                postalCode,
                country
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                name: true,
                role: true,
                emailVerified: true,
                phone: true,
                streetAddress: true,
                city: true,
                province: true,
                postalCode: true,
                country: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating your profile'
        });
    }
}