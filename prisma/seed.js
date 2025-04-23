// Seed script to populate database with initial data
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bgh.com' },
    update: {},
    create: {
      email: 'admin@bgh.com',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true
    }
  });
  console.log('Admin user created:', admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash('User123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      firstName: 'Regular',
      lastName: 'User',
      password: userPassword,
      role: 'USER',
      emailVerified: true,
      streetAddress: '123 Main St',
      city: 'Anytown',
      postalCode: '12345',
      province: 'State',
      country: 'Country',
      termsAccepted: true
    }
  });
  console.log('Regular user created:', user.email);

  // Create sample rooms
  const roomTypes = ['STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL'];
  const roomStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE'];
  
  // Delete existing rooms first
  await prisma.room.deleteMany({});
  
  // Create 10 sample rooms
  for (let i = 1; i <= 10; i++) {
    const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    const roomStatus = i <= 7 ? 'AVAILABLE' : roomStatuses[Math.floor(Math.random() * roomStatuses.length)];
    
    // Set price based on room type
    let price = 100; // Base price for STANDARD
    if (roomType === 'DELUXE') price = 150;
    if (roomType === 'SUITE') price = 200;
    if (roomType === 'EXECUTIVE') price = 300;
    if (roomType === 'PRESIDENTIAL') price = 500;
    
    // Randomize price slightly
    price += Math.floor(Math.random() * 50);
    
    const roomNumber = `${Math.floor(Math.random() * 5) + 1}${String(i).padStart(2, '0')}`;
    
    const room = await prisma.room.create({
      data: {
        roomNumber,
        type: roomType,
        price,
        status: roomStatus,
        description: `A beautiful ${roomType.toLowerCase()} room with all amenities.`,
        image: `https://source.unsplash.com/random/800x600/?hotel,room,${roomType.toLowerCase()}`,
        amenities: 'WiFi, TV, Air Conditioning, Mini Bar, Safe, Coffee Maker'
      }
    });
    
    console.log(`Room created: ${room.roomNumber} (${room.type})`);
  }

  // Create sample bookings
  // First delete existing bookings
  await prisma.booking.deleteMany({});
  
  // Get all available rooms
  const availableRooms = await prisma.room.findMany({
    where: { status: 'AVAILABLE' }
  });
  
  if (availableRooms.length > 0) {
    // Create a few bookings
    const today = new Date();
    
    // Booking 1: Upcoming booking
    const checkInDate1 = new Date(today);
    checkInDate1.setDate(today.getDate() + 5); // 5 days from now
    
    const checkOutDate1 = new Date(checkInDate1);
    checkOutDate1.setDate(checkInDate1.getDate() + 3); // 3-day stay
    
    await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: availableRooms[0].id,
        checkInDate: checkInDate1,
        checkOutDate: checkOutDate1,
        numberOfGuests: 2,
        specialRequests: 'Late check-in, around 8pm',
        status: 'CONFIRMED',
        totalPrice: availableRooms[0].price * 3 // 3-day stay
      }
    });
    console.log('Created upcoming booking');
    
    // Booking 2: Current booking (checked in)
    const checkInDate2 = new Date(today);
    checkInDate2.setDate(today.getDate() - 1); // Yesterday
    
    const checkOutDate2 = new Date(today);
    checkOutDate2.setDate(today.getDate() + 2); // 3-day stay total
    
    await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: availableRooms[1].id,
        checkInDate: checkInDate2,
        checkOutDate: checkOutDate2,
        numberOfGuests: 1,
        specialRequests: 'Extra towels',
        status: 'CHECKED_IN',
        totalPrice: availableRooms[1].price * 3 // 3-day stay
      }
    });
    console.log('Created current (checked-in) booking');
    
    // Booking 3: Pending booking
    const checkInDate3 = new Date(today);
    checkInDate3.setDate(today.getDate() + 10); // 10 days from now
    
    const checkOutDate3 = new Date(checkInDate3);
    checkOutDate3.setDate(checkInDate3.getDate() + 5); // 5-day stay
    
    await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: availableRooms[2].id,
        checkInDate: checkInDate3,
        checkOutDate: checkOutDate3,
        numberOfGuests: 4,
        specialRequests: 'High floor room',
        status: 'PENDING',
        totalPrice: availableRooms[2].price * 5 // 5-day stay
      }
    });
    console.log('Created pending booking');
  }
  
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });