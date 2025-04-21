// pages/api/admin/stats.js
import prisma from '../../../lib/prisma';
import { withAdminAuth } from '../../../lib/apiHandler';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Get stats from database - no need to check auth again
        const totalUsers = await prisma.user.count();
        // ... rest of the code

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                // ...other stats
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
}

export default withAdminAuth(handler);