import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        // Create sample rooms
        const rooms = await Promise.all([
            prisma.room.create({
                data: {
                    roomNumber: '101',
                    type: 'DELUXE',
                    status: 'AVAILABLE',
                    price: 199.99,
                    description: 'Luxurious deluxe room with garden view',
                    amenities: JSON.stringify(['King Bed', 'Garden View', 'Mini Bar', 'Free WiFi']),
                },
            }),
            prisma.room.create({
                data: {
                    roomNumber: '102',
                    type: 'SUITE',
                    status: 'AVAILABLE',
                    price: 299.99,
                    description: 'Spacious suite with separate living area',
                    amenities: JSON.stringify(['King Bed', 'Living Room', 'Jacuzzi', 'Free WiFi', 'City View']),
                },
            }),
            prisma.room.create({
                data: {
                    roomNumber: '201',
                    type: 'STANDARD',
                    status: 'AVAILABLE',
                    price: 149.99,
                    description: 'Comfortable standard room',
                    amenities: JSON.stringify(['Queen Bed', 'Work Desk', 'Free WiFi']),
                },
            }),
        ]);

        // Create sample users
        const hashedPassword = await hash('Password123!', 12);

        const users = await Promise.all([
            prisma.user.create({
                data: {
                    name: 'John Admin',
                    email: 'admin@example.com',
                    password: hashedPassword,
                    role: 'ADMIN',
                    firstName: 'John',
                    lastName: 'Admin',
                    emailVerified: true,
                    streetAddress: '123 Admin St',
                    city: 'Admin City',
                    postalCode: '12345',
                    province: 'Admin Province',
                    country: 'USA',
                    termsAccepted: true,
                    phone: '+1234567890',
                },
            }),
            prisma.user.create({
                data: {
                    name: 'Jane Customer',
                    email: 'customer@example.com',
                    password: hashedPassword,
                    role: 'CUSTOMER',
                    firstName: 'Jane',
                    lastName: 'Customer',
                    emailVerified: true,
                    streetAddress: '456 Customer Ave',
                    city: 'Customer City',
                    postalCode: '67890',
                    province: 'Customer Province',
                    country: 'USA',
                    termsAccepted: true,
                    phone: '+0987654321',
                },
            }),
        ]);

        // Create sample bookings
        const bookings = await Promise.all([
            prisma.booking.create({
                data: {
                    userId: users[1].id,
                    roomId: rooms[0].id,
                    checkInDate: new Date('2024-04-01'),
                    checkOutDate: new Date('2024-04-03'),
                    numberOfGuests: 2,
                    specialRequests: 'Early check-in requested',
                    status: 'CONFIRMED',
                    totalPrice: 399.98,
                    payment: {
                        create: {
                            userId: users[1].id,
                            amount: 399.98,
                            paymentIntentId: 'pi_mock_123',
                            status: 'COMPLETED',
                            paymentMethod: 'CREDIT_CARD',
                            paymentDate: new Date(),
                        },
                    },
                },
            }),
            prisma.booking.create({
                data: {
                    userId: users[1].id,
                    roomId: rooms[1].id,
                    checkInDate: new Date('2024-05-15'),
                    checkOutDate: new Date('2024-05-17'),
                    numberOfGuests: 2,
                    status: 'PENDING',
                    totalPrice: 599.98,
                },
            }),
        ]);

        console.log('Seed data created successfully');
        console.log(`Created ${rooms.length} rooms`);
        console.log(`Created ${users.length} users`);
        console.log(`Created ${bookings.length} bookings`);

    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 