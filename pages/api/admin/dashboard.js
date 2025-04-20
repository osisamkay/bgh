// pages/api/admin/dashboard.js
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token and get user
        const user = await verifyToken(token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Run all database queries in parallel
        const [
            totalUsersCount,
            totalBookingsCount,
            revenueData,
            occupancyData,
            recentBookings,
            recentUsers
        ] = await Promise.all([
            // Total users count
            prisma.user.count(),

            // Total bookings count with active count
            prisma.booking.count(),

            // Total revenue with SQL aggregation
            prisma.$queryRaw`
        SELECT SUM(totalPrice) as total
        FROM Booking
        WHERE status = 'CONFIRMED'
      `,

            // Occupancy data
            prisma.$transaction([
                prisma.room.count(),
                prisma.booking.count({
                    where: {
                        status: 'CONFIRMED',
                        checkInDate: {
                            lte: new Date()
                        },
                        checkOutDate: {
                            gte: new Date()
                        }
                    }
                })
            ]),

            // Recent bookings
            prisma.booking.findMany({
                take: 10,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    room: {
                        select: {
                            roomNumber: true,
                            type: true
                        }
                    }
                }
            }),

            // Recent users
            prisma.user.findMany({
                take: 10,
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    emailVerified: true,
                    createdAt: true
                }
            })
        ]);

        // Format the recent bookings response
        const formattedBookings = recentBookings.map(booking => ({
            id: booking.id,
            guestName: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Guest',
            roomType: booking.room?.type || 'Standard',
            roomNumber: booking.room?.roomNumber || '',
            checkIn: booking.checkInDate,
            checkOut: booking.checkOutDate,
            status: booking.status,
            totalPrice: booking.totalPrice || 0,
            createdAt: booking.createdAt
        }));

        // Format the recent users response
        const formattedUsers = recentUsers.map(user => ({
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
            email: user.email || '',
            verified: user.emailVerified || false,
            createdAt: user.createdAt
        }));

        // Calculate occupancy rate
        const [totalRooms, occupiedRooms] = occupancyData;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // Get revenue data for chart
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(checkInDate, '%Y-%m') as month,
        SUM(totalPrice) as revenue
      FROM Booking
      WHERE 
        status = 'CONFIRMED' AND
        checkInDate >= ${twelveMonthsAgo}
      GROUP BY DATE_FORMAT(checkInDate, '%Y-%m')
      ORDER BY month ASC
    `;

        // Return comprehensive dashboard data in one response
        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers: totalUsersCount || 0,
                    activeUsers: totalUsersCount || 0, // Replace with active count logic if available
                    totalBookings: totalBookingsCount || 0,
                    activeBookings: occupiedRooms || 0,
                    totalRevenue: revenueData[0]?.total || 0,
                    occupancyRate: occupancyRate
                },
                recentBookings: formattedBookings,
                recentUsers: formattedUsers,
                revenueData: monthlyRevenue.map(item => ({
                    date: item.month,
                    revenue: parseFloat(item.revenue) || 0
                })),
                occupancyData: [
                    { name: 'Occupied', value: occupancyRate },
                    { name: 'Available', value: 100 - occupancyRate }
                ]
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
}