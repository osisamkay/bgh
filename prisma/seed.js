const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
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
      image: 'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070'
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
      image: 'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070'
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
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070'
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
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
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
    },
    {
      roomNumber: '203',
      type: 'Business Suite',
      status: 'AVAILABLE',
      price: 280,
      description: 'Modern suite designed for business travelers',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Free Wi-Fi',
        '49\" Smart TV',
        'Work desk with ergonomic chair',
        'Printer/scanner',
        'Coffee maker',
        'Rain shower',
        '24/7 room service'
      ])
    },
    {
      roomNumber: '301',
      type: 'Presidential Suite',
      status: 'AVAILABLE',
      price: 600,
      description: 'Luxurious presidential suite with panoramic views',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Panoramic city view',
        'Separate living and dining areas',
        'Free Wi-Fi',
        '65\" Smart TV',
        'Full bar',
        'Work desk',
        'Jacuzzi',
        'Butler service',
        'Private elevator access'
      ])
    },
    {
      roomNumber: '302',
      type: 'Honeymoon Suite',
      status: 'AVAILABLE',
      price: 450,
      description: 'Romantic suite perfect for honeymooners',
      image: 'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Ocean view',
        'Private balcony',
        'Free Wi-Fi',
        '55\" Smart TV',
        'Champagne on arrival',
        'Jacuzzi',
        'Rain shower',
        'Romantic turndown service'
      ])
    },
    {
      roomNumber: '303',
      type: 'Accessible Room',
      status: 'AVAILABLE',
      price: 200,
      description: 'Comfortable accessible room with all necessary amenities',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'Queen-size bed',
        'Free Wi-Fi',
        '40\" Smart TV',
        'Roll-in shower',
        'Grab bars',
        'Lowered fixtures',
        'Wheelchair accessible',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '401',
      type: 'Penthouse Suite',
      status: 'AVAILABLE',
      price: 800,
      description: 'Exclusive penthouse with private terrace',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Private terrace',
        'Panoramic city view',
        'Free Wi-Fi',
        '75\" Smart TV',
        'Full bar',
        'Work desk',
        'Jacuzzi',
        'Butler service',
        'Private elevator access'
      ])
    },
    {
      roomNumber: '402',
      type: 'Garden View Room',
      status: 'AVAILABLE',
      price: 220,
      description: 'Peaceful room overlooking the hotel gardens',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'Queen-size bed',
        'Garden view',
        'Free Wi-Fi',
        '40\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '403',
      type: 'Studio Suite',
      status: 'AVAILABLE',
      price: 230,
      description: 'Modern studio with kitchenette',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'Queen-size bed',
        'Kitchenette',
        'Free Wi-Fi',
        '40\" Smart TV',
        'Mini fridge',
        'Microwave',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '501',
      type: 'Corner Suite',
      status: 'AVAILABLE',
      price: 320,
      description: 'Spacious corner suite with extra windows',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Corner windows',
        'Free Wi-Fi',
        '55\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '502',
      type: 'Deluxe Twin Room',
      status: 'AVAILABLE',
      price: 240,
      description: 'Comfortable twin room with city view',
      image: 'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'Two twin beds',
        'City view',
        'Free Wi-Fi',
        '40\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '503',
      type: 'Junior Suite',
      status: 'AVAILABLE',
      price: 280,
      description: 'Comfortable junior suite with sitting area',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Sitting area',
        'Free Wi-Fi',
        '49\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '601',
      type: 'Pool View Room',
      status: 'AVAILABLE',
      price: 260,
      description: 'Room with direct view of the pool area',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'Queen-size bed',
        'Pool view',
        'Free Wi-Fi',
        '40\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '602',
      type: 'Mountain View Room',
      status: 'AVAILABLE',
      price: 270,
      description: 'Room with stunning mountain views',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'Queen-size bed',
        'Mountain view',
        'Free Wi-Fi',
        '40\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '603',
      type: 'City View Room',
      status: 'AVAILABLE',
      price: 250,
      description: 'Room with panoramic city views',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'Queen-size bed',
        'City view',
        'Free Wi-Fi',
        '40\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
      ])
    },
    {
      roomNumber: '701',
      type: 'Luxury Suite',
      status: 'AVAILABLE',
      price: 500,
      description: 'Ultra-luxurious suite with premium amenities',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'King-size bed',
        'Panoramic views',
        'Free Wi-Fi',
        '65\" Smart TV',
        'Full bar',
        'Work desk',
        'Jacuzzi',
        'Rain shower',
        'Butler service',
        'Private elevator access'
      ])
    },
    {
      roomNumber: '702',
      type: 'Standard Queen Room',
      status: 'AVAILABLE',
      price: 190,
      description: 'Comfortable standard room with queen bed',
      image: 'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566669437685-6e6b0a3b0b0b?q=80&w=2070',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070'
      ]),
      amenities: JSON.stringify([
        'Queen-size bed',
        'Free Wi-Fi',
        '40\" Smart TV',
        'Mini bar',
        'Work desk',
        'Rain shower',
        'Coffee maker'
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