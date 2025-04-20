import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
    // Only allow PUT method
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization token' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token and get user data
        const userData = await verifyToken(token);
        if (!userData || !userData.userId) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { firstName, lastName, phone, address } = req.body;

        // Update user with all fields including address
        const updatedUser = await prisma.user.update({
            where: {
                id: userData.userId
            },
            data: {
                firstName,
                lastName,
                phone,
                streetAddress: address.street,
                city: address.city,
                province: address.province,
                postalCode: address.postalCode,
                country: 'Canada' // Default to Canada
            },
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
                customerId: true
            }
        });

        // Transform the response to match the frontend expectations
        const responseData = {
            ...updatedUser,
            address: {
                street: updatedUser.streetAddress,
                city: updatedUser.city,
                province: updatedUser.province,
                postalCode: updatedUser.postalCode
            }
        };

        // Remove the individual address fields from the root level
        delete responseData.streetAddress;
        delete responseData.city;
        delete responseData.province;
        delete responseData.postalCode;
        delete responseData.country;

        // Return the updated user data
        return res.status(200).json(responseData);
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
} 