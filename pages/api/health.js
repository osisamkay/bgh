import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Test database connection
        const dbTest = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;

        // Check environment variables
        const envCheck = {
            nodeEnv: process.env.NODE_ENV,
            hasPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
            hasNonPoolingUrl: Boolean(process.env.POSTGRES_URL_NON_POOLING),
            prismaUrlLength: process.env.POSTGRES_PRISMA_URL?.length || 0,
            nonPoolingUrlLength: process.env.POSTGRES_URL_NON_POOLING?.length || 0,
            // Check if URLs contain required components
            prismaUrlCheck: {
                hasPooler: process.env.POSTGRES_PRISMA_URL?.includes('-pooler'),
                hasSsl: process.env.POSTGRES_PRISMA_URL?.includes('sslmode=require'),
                hasTimeout: process.env.POSTGRES_PRISMA_URL?.includes('connect_timeout=')
            }
        };

        // Test Prisma model access
        const modelCheck = await Promise.allSettled([
            prisma.user.count(),
            prisma.room.count(),
            prisma.booking.count()
        ]);

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            database: {
                version: dbTest[0].version,
                name: dbTest[0].current_database,
                user: dbTest[0].current_user
            },
            environment: envCheck,
            models: {
                user: modelCheck[0].status === 'fulfilled' ? modelCheck[0].value : modelCheck[0].reason?.message,
                room: modelCheck[1].status === 'fulfilled' ? modelCheck[1].value : modelCheck[1].reason?.message,
                booking: modelCheck[2].status === 'fulfilled' ? modelCheck[2].value : modelCheck[2].reason?.message
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);
        return res.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
                meta: error.meta || {}
            },
            environment: {
                nodeEnv: process.env.NODE_ENV,
                hasPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
                hasNonPoolingUrl: Boolean(process.env.POSTGRES_URL_NON_POOLING)
            }
        });
    }
} 