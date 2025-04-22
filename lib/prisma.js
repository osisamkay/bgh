import { PrismaClient } from '@prisma/client';

function getPrismaClient() {
    try {
        return new PrismaClient({
            log: ['error', 'warn', 'query'],
            errorFormat: 'pretty',
            datasources: {
                db: {
                    url: process.env.NODE_ENV === 'production'
                        ? process.env.POSTGRES_PRISMA_URL
                        : process.env.POSTGRES_URL_NON_POOLING
                }
            },
            // Add connection retry logic
            __internal: {
                engine: {
                    connectTimeout: 10000, // 10 seconds
                    retry: {
                        maxRetries: 3,
                        initialDelay: 500, // 500ms
                        maxDelay: 5000 // 5 seconds
                    }
                }
            }
        });
    } catch (e) {
        console.error('Failed to initialize Prisma client:', e);
        throw e;
    }
}

// For development, save a reference to a single client
let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = getPrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = getPrismaClient();
    }
    prisma = global.prisma;
}

// Add connection validation
prisma.$on('beforeExit', async () => {
    console.log('Prisma Client is disconnecting');
});

// Validate connection on startup
(async () => {
    try {
        await prisma.$connect();
        console.log('Prisma Client connected successfully');
    } catch (error) {
        console.error('Failed to connect to database:', error);
    }
})();

export default prisma; 