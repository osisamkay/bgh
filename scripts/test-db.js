import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
        db: {
            url: 'postgres://neondb_owner:npg_1OMeml2QFJtU@ep-little-resonance-a5usvyvq-pooler.us-east-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require'
        }
    }
});

async function testConnection() {
    try {
        // Test raw query
        console.log('Testing database connection...');
        const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;
        console.log('Database connection successful:', result);

        // Test table access
        console.log('\nTesting table access...');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);

        const roomCount = await prisma.room.count();
        console.log('Room count:', roomCount);

        const bookingCount = await prisma.booking.count();
        console.log('Booking count:', bookingCount);

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection(); 