import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      firstName: 'Admin',
      lastName: 'User',
      termsAccepted: true,
    },
  });

  // Create sample rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        roomNumber: '101',
        type: 'STANDARD',
        status: 'AVAILABLE',
        price: 100.00,
        description: 'Comfortable standard room with a queen bed',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1920&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1631049035182-249067d7618e?auto=format&fit=crop&w=1920&q=80'
        ]),
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom']),
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '102',
        type: 'DELUXE',
        status: 'AVAILABLE',
        price: 150.00,
        description: 'Spacious deluxe room with a king bed and city view',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1582719508461-957e41e34d99?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1582719478501-0f6e0d2b7a3b?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1582719478501-0f6e0d2b7a3c?auto=format&fit=crop&w=1920&q=80'
        ]),
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'City View']),
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '201',
        type: 'SUITE',
        status: 'AVAILABLE',
        price: 250.00,
        description: 'Luxury suite with separate living area and ocean view',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1920&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1590490360787-3a26f1d75fd6?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1590490360538-eb20758a6f94?auto=format&fit=crop&w=1920&q=80'
        ]),
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Ocean View', 'Living Room', 'Kitchen']),
      },
    }),
  ]);

  // Create a sample booking
  const booking = await prisma.booking.create({
    data: {
      userId: admin.id,
      roomId: rooms[0].id,
      checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      checkOutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      numberOfGuests: 2,
      specialRequests: 'Early check-in requested',
      status: 'CONFIRMED',
      totalPrice: 300.00,
    },
  });

  console.log('Seed data created successfully:', {
    admin: { id: admin.id, email: admin.email },
    rooms: rooms.map(room => ({ id: room.id, number: room.roomNumber })),
    booking: { id: booking.id, status: booking.status },
  });
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });