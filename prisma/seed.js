const { PrismaClient } = require('@prisma/client');
// Use a separate instance for seeding
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@hotel.com',
      firstName: 'Admin',
      lastName: 'User',
      password: '$2b$10$ME.wxnociqucwZl18GLY1.vV/zwEc7MMmYYniV0q2iPR.06TocVWm',
      role: 'ADMIN',
      streetAddress: '123 Admin St',
      city: 'Admin City',
      postalCode: '12345',
      province: 'AB',
      country: 'Canada',
      termsAccepted: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Create manager user
  const manager = await prisma.user.create({
    data: {
      name: 'Manager User',
      email: 'manager@hotel.com',
      firstName: 'Manager',
      lastName: 'User',
      password: '$2b$10$ME.wxnociqucwZl18GLY1.vV/zwEc7MMmYYniV0q2iPR.06TocVWm',
      role: 'MANAGER',
      streetAddress: '123 Manager St',
      city: 'Manager City',
      postalCode: '12345',
      province: 'AB',
      country: 'Canada',
      termsAccepted: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Create front desk user
  const frontDesk = await prisma.user.create({
    data: {
      name: 'Front Desk User',
      email: 'frontdesk@hotel.com',
      firstName: 'Front Desk',
      lastName: 'User',
      password: '$2b$10$ME.wxnociqucwZl18GLY1.vV/zwEc7MMmYYniV0q2iPR.06TocVWm',
      role: 'FRONT_DESK',
      streetAddress: '123 Front Desk St',
      city: 'Front Desk City',
      postalCode: '12345',
      province: 'AB',
      country: 'Canada',
      termsAccepted: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Create rooms
  const rooms = [
    {
      roomNumber: '101',
      type: 'Deluxe King Room',
      status: 'AVAILABLE',
      price: 250,
      description: 'Spacious room with king-size bed and city view',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1920&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1631049035182-249067d7618e?auto=format&fit=crop&w=1920&q=80'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'City view',
        'Free Wi-Fi',
        '49\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '102',
      type: 'Standard Twin Room',
      status: 'AVAILABLE',
      price: 180,
      description: 'Comfortable room with two twin beds',
      image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1920&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1595576508485-471de1245019?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1595576508517-7f0b25b836c0?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1595576508556-4f96f3e1fc96?auto=format&fit=crop&w=1920&q=80'
      ]),
      amenities: JSON.stringify([
        'Two twin beds',
        'Free Wi-Fi',
        '32\" Smart TV',
        'Work desk',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '103',
      type: 'Executive Suite',
      status: 'AVAILABLE',
      price: 400,
      description: 'Luxurious suite with separate living area',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1920&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1590490360787-3a26f1d75fd6?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1590490360538-eb20758a6f94?auto=format&fit=crop&w=1920&q=80'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Separate living area',
        'Free Wi-Fi',
        '55\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker',
        'Room service'
      ])
    },
    {
      roomNumber: '201',
      type: 'Ocean View Suite',
      status: 'AVAILABLE',
      price: 350,
      description: 'Stunning ocean view suite with balcony',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1582719508461-957e41e34d99?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1582719478501-0f6e0d2b7a3b?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1582719478501-0f6e0d2b7a3c?auto=format&fit=crop&w=1920&q=80'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Ocean view',
        'Private balcony',
        'Free Wi-Fi',
        '55\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '202',
      type: 'Family Suite',
      status: 'AVAILABLE',
      price: 300,
      description: 'Spacious suite perfect for families',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1616594039999-3e9c0bcd2a3e?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1616594039904-fe1696e13052?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1616594039942-4b341b61f052?auto=format&fit=crop&w=1920&q=80'
      ]),
      amenities: JSON.stringify([
        'Two queen beds',
        'Sofa bed',
        'Free Wi-Fi',
        '55\" Smart TV',
        'Mini fridge',
        'Work desk',
        'Bathtub',
        'Coffee maker',
        'Crib available'
      ])
    }
  ];

  // Create rooms in database
  for (const room of rooms) {
    await prisma.room.create({
      data: room
    });
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });