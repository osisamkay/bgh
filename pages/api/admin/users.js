import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const session = await getSession({ req });

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        switch (req.method) {
            case 'GET':
                // Get all users with selected fields
                const users = await prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        emailVerified: true,
                        emailVerifiedAt: true,
                        firstName: true,
                        lastName: true,
                        streetAddress: true,
                        city: true,
                        postalCode: true,
                        province: true,
                        country: true,
                        phone: true,
                        customerId: true,
                        createdAt: true,
                        updatedAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
                return res.status(200).json(users);

            case 'PUT':
                // Update user
                const { id, ...updateData } = req.body;

                // Validate required fields
                if (!id) {
                    return res.status(400).json({ error: 'User ID is required' });
                }

                // Only allow updating specific fields
                const allowedFields = [
                    'name',
                    'firstName',
                    'lastName',
                    'streetAddress',
                    'city',
                    'postalCode',
                    'province',
                    'country',
                    'phone',
                    'role',
                    'emailVerified'
                ];

                const filteredUpdateData = Object.keys(updateData)
                    .filter(key => allowedFields.includes(key))
                    .reduce((obj, key) => {
                        obj[key] = updateData[key];
                        return obj;
                    }, {});

                const updatedUser = await prisma.user.update({
                    where: { id },
                    data: filteredUpdateData,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        emailVerified: true,
                        emailVerifiedAt: true,
                        firstName: true,
                        lastName: true,
                        streetAddress: true,
                        city: true,
                        postalCode: true,
                        province: true,
                        country: true,
                        phone: true,
                        customerId: true,
                        createdAt: true,
                        updatedAt: true
                    }
                });
                return res.status(200).json(updatedUser);

            case 'DELETE':
                // Delete user
                const { userId } = req.query;

                if (!userId) {
                    return res.status(400).json({ error: 'User ID is required' });
                }

                // Check if user exists
                const userExists = await prisma.user.findUnique({
                    where: { id: userId }
                });

                if (!userExists) {
                    return res.status(404).json({ error: 'User not found' });
                }

                await prisma.user.delete({
                    where: { id: userId }
                });
                return res.status(200).json({ message: 'User deleted successfully' });

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error in users API:', error);

        // Handle specific Prisma errors
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Unique constraint violation' });
        }

        return res.status(500).json({ error: 'Internal Server Error' });
    }
} 