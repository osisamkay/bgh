import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
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

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userData.userId
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
                    customerId: true,
                    createdAt: true,
                    updatedAt: true,
                    emailVerified: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Transform the response to match the frontend expectations
            const responseData = {
                ...user,
                address: {
                    street: user.streetAddress,
                    city: user.city,
                    province: user.province,
                    postalCode: user.postalCode
                }
            };

            // Remove the individual address fields from the root level
            delete responseData.streetAddress;
            delete responseData.city;
            delete responseData.province;
            delete responseData.postalCode;
            delete responseData.country;

            return res.status(200).json(responseData);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return res.status(500).json({ error: 'Failed to fetch profile' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { firstName, lastName, phone, address } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !phone || !address) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    details: 'Please provide all required information'
                });
            }

            // Validate address fields
            if (!address.street || !address.city || !address.province || !address.postalCode) {
                return res.status(400).json({
                    error: 'Invalid address',
                    details: 'Please provide complete address information'
                });
            }

            // Validate phone format
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    error: 'Invalid phone number',
                    details: 'Please enter a valid phone number with at least 10 digits'
                });
            }

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
                    country: 'Canada', // Default to Canada
                    updatedAt: new Date() // Add timestamp
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
                    customerId: true,
                    updatedAt: true
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

            return res.status(200).json(responseData);
        } catch (error) {
            console.error('Profile update error:', error);
            return res.status(500).json({ error: 'Failed to update profile' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
} 