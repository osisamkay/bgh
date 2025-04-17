import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'FRONT_DESK' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const name = searchParams.get('name');

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (date) {
      where.OR = [
        { checkInDate: { lte: new Date(date) } },
        { checkOutDate: { gte: new Date(date) } }
      ];
    }
    if (name) {
      where.user = {
        OR: [
          { firstName: { contains: name, mode: 'insensitive' } },
          { lastName: { contains: name, mode: 'insensitive' } }
        ]
      };
    }

    const reservations = await prisma.booking.findMany({
      where,
      include: {
        user: true,
        room: true,
        checkInDetails: true,
        checkOutDetails: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'FRONT_DESK' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
      staffId
    } = data;

    // Create or find user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        phone
      },
      create: {
        firstName,
        lastName,
        email,
        phone,
        password: 'temporary', // Will be updated when user sets their password
        streetAddress: '',
        city: '',
        postalCode: '',
        province: '',
        country: '',
        termsAccepted: true
      }
    });

    // Find available rooms
    const availableRooms = await prisma.room.findMany({
      where: {
        type: roomType,
        status: 'AVAILABLE',
        bookings: {
          none: {
            OR: [
              {
                checkInDate: { lte: new Date(checkOutDate) },
                checkOutDate: { gte: new Date(checkInDate) },
                status: { not: 'CANCELLED' }
              }
            ]
          }
        }
      },
      take: numberOfRooms
    });

    if (availableRooms.length < numberOfRooms) {
      return NextResponse.json(
        { error: 'Not enough rooms available' },
        { status: 400 }
      );
    }

    // Create reservations for each room
    const reservations = await Promise.all(
      availableRooms.map(room =>
        prisma.booking.create({
          data: {
            userId: user.id,
            roomId: room.id,
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            numberOfGuests,
            status: 'PENDING',
            totalPrice: room.price * Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          include: {
            user: true,
            room: true
          }
        })
      )
    );

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Reservation Confirmation',
      html: `
        <h2>Reservation Confirmation</h2>
        <p>Dear ${firstName},</p>
        <p>Your reservation has been successfully created.</p>
        <h3>Reservation Details:</h3>
        <ul>
          <li>Room Type: ${roomType}</li>
          <li>Number of Rooms: ${numberOfRooms}</li>
          <li>Check-in Date: ${new Date(checkInDate).toLocaleDateString()}</li>
          <li>Check-out Date: ${new Date(checkOutDate).toLocaleDateString()}</li>
          <li>Number of Guests: ${numberOfGuests}</li>
        </ul>
        <p>Please complete your booking within 1 hour to confirm your reservation.</p>
      `
    });

    // Log reservation creation
    await prisma.employeeLog.create({
      data: {
        type: 'RESERVATION_CREATED',
        userId: staffId,
        userName: session.user.name,
        timestamp: new Date(),
        details: JSON.stringify({
          userId: user.id,
          numberOfRooms,
          roomType,
          checkInDate,
          checkOutDate
        })
      }
    });

    return NextResponse.json({
      success: true,
      reservations
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
} 