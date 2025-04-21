// pages/api/admin/settings.js
import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    // Authenticate admin
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

    // Handle GET and PUT methods
    switch (req.method) {
        case 'GET':
            return getSettings(req, res);
        case 'PUT':
            return updateSettings(req, res);
        default:
            return res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
    }
}

// Get app settings
async function getSettings(req, res) {
    try {
        // Try to find existing settings
        const settings = await prisma.setting.findFirst();

        // If no settings exist yet, return defaults
        if (!settings) {
            const defaultSettings = {
                emailNotifications: true,
                maintenanceMode: false,
                maxBookingsPerUser: 5,
                cancellationPolicy: '24 hours',
                checkInTime: '14:00',
                checkOutTime: '12:00'
            };

            return res.status(200).json({
                success: true,
                data: defaultSettings
            });
        }

        return res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching settings',
            error: error.message
        });
    }
}

// Update app settings
async function updateSettings(req, res) {
    try {
        const {
            emailNotifications,
            maintenanceMode,
            maxBookingsPerUser,
            cancellationPolicy,
            checkInTime,
            checkOutTime
        } = req.body;

        // Validate required fields
        if (
            emailNotifications === undefined ||
            maintenanceMode === undefined ||
            !maxBookingsPerUser ||
            !cancellationPolicy ||
            !checkInTime ||
            !checkOutTime
        ) {
            return res.status(400).json({
                success: false,
                message: 'All settings fields are required'
            });
        }

        // Upsert settings (update if exists, create if not)
        const settings = await prisma.setting.upsert({
            where: { id: 1 }, // Assuming a single settings record with ID 1
            update: {
                emailNotifications,
                maintenanceMode,
                maxBookingsPerUser,
                cancellationPolicy,
                checkInTime,
                checkOutTime
            },
            create: {
                id: 1,
                emailNotifications,
                maintenanceMode,
                maxBookingsPerUser,
                cancellationPolicy,
                checkInTime,
                checkOutTime
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating settings',
            error: error.message
        });
    }
}