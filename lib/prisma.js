import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['error', 'warn'],
        errorFormat: 'pretty',
        datasources: {
            db: {
                url: process.env.NODE_ENV === 'production'
                    ? process.env.POSTGRES_PRISMA_URL
                    : process.env.POSTGRES_URL_NON_POOLING
            }
        },
        // Add connection pooling configuration
        connection: {
            pool: {
                min: 0,
                max: 5,
                idleTimeoutMillis: 30000
            }
        }
    });
};

// Global object for storing Prisma instance
const globalForPrisma = global;
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prismaClientSingleton();
}

const prisma = globalForPrisma.prisma;

export default prisma; 