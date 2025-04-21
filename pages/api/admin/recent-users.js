import prisma from '../../../lib/prisma';
import { verifyToken } from '../../../utils/auth';

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

        // Verify token and get user
        const user = await verifyToken(token);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const recentUsers = await prisma.user.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                emailVerified: true,
                createdAt: true
            }
        });

        return res.status(200).json(recentUsers);
    } catch (error) {
        console.error('Error fetching recent users:', error);
        return res.status(500).json({ message: 'Error fetching recent users' });
    }
} 