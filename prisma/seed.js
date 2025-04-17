const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hotel.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@hotel.com',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu.Vm', // hashed password
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      streetAddress: '123 Admin St',
      city: 'Admin City',
      postalCode: '12345',
      province: 'Admin Province',
      country: 'Admin Country',
      termsAccepted: true
    }
  });

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@hotel.com' },
    update: {},
    create: {
      name: 'Manager User',
      email: 'manager@hotel.com',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu.Vm', // hashed password
      role: 'MANAGER',
      firstName: 'Manager',
      lastName: 'User',
      streetAddress: '123 Manager St',
      city: 'Manager City',
      postalCode: '12345',
      province: 'Manager Province',
      country: 'Manager Country',
      termsAccepted: true
    }
  });

  // Create front desk user
  const frontDesk = await prisma.user.upsert({
    where: { email: 'frontdesk@hotel.com' },
    update: {},
    create: {
      name: 'Front Desk User',
      email: 'frontdesk@hotel.com',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu.Vm', // hashed password
      role: 'FRONT_DESK',
      firstName: 'Front Desk',
      lastName: 'User',
      streetAddress: '123 Front Desk St',
      city: 'Front Desk City',
      postalCode: '12345',
      province: 'Front Desk Province',
      country: 'Front Desk Country',
      termsAccepted: true
    }
  });

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        number: '101',
        type: 'STANDARD',
        status: 'AVAILABLE',
        price: 100.00,
        description: 'Standard room with queen bed',
        amenities: JSON.stringify(['TV', 'WiFi', 'Air Conditioning'])
      }
    }),
    prisma.room.create({
      data: {
        number: '102',
        type: 'DELUXE',
        status: 'AVAILABLE',
        price: 150.00,
        description: 'Deluxe room with king bed',
        amenities: JSON.stringify(['TV', 'WiFi', 'Air Conditioning', 'Mini Bar'])
      }
    }),
    prisma.room.create({
      data: {
        number: '201',
        type: 'SUITE',
        status: 'AVAILABLE',
        price: 200.00,
        description: 'Suite with living area',
        amenities: JSON.stringify(['TV', 'WiFi', 'Air Conditioning', 'Mini Bar', 'Living Room'])
      }
    })
  ]);

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 