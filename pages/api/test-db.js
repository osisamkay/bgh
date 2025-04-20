import prisma from '../../lib/prisma';

// Helper function to handle BigInt serialization
function serializeBigInt(obj) {
    return JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    );
}

export default async function handler(req, res) {
    try {
        // Try to connect to the database and perform a simple query
        const testQuery = await prisma.$queryRaw`SELECT 1+1 as result`;

        // Check if we can access the User table
        const userCount = await prisma.user.count();

        // Create response object
        const response = {
            success: true,
            message: 'Database connection successful',
            testQuery: testQuery,
            userCount: userCount
        };

        // Send response with proper serialization
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(serializeBigInt(response));
    } catch (error) {
        console.error('Database connection error:', error);
        const errorResponse = {
            success: false,
            message: 'Database connection failed',
            error: error.message,
            stack: error.stack
        };
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(serializeBigInt(errorResponse));
    }
} 