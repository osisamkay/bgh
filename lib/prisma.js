import { PrismaClient } from '@prisma/client';

function getPrismaClient() {
    try {
        return new PrismaClient({
            log: ['error', 'warn'],
            errorFormat: 'pretty',
            datasources: {
                db: {
                    url: process.env.NODE_ENV === 'production'
                        ? process.env.POSTGRES_PRISMA_URL
                        : process.env.POSTGRES_URL_NON_POOLING
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

export default prisma; 