import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReservationEmail } from '../../utils/emailService';

export async function GET(req) {
  try {
    const reservations = await prisma.booking.findMany({
      include: {
        user: true,
        room: true,
        checkInDetails: true,
        checkOutDetails: true,
        payment: true,
        refund: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const {
      fullName,
      email,
      phone,
      specialRequests,
      id,
      agreeToTerms,
      checkInDate,
      checkOutDate,
      numberOfGuests
    } = await req.json();

    // Validate required fields
    if (!fullName || !email || !phone || !id || !agreeToTerms || !checkInDate || !checkOutDate || !numberOfGuests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Find room
    const room = await prisma.room.findUnique({
      where: { id }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if user exists with this email
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // If user doesn't exist, create a temporary user
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: fullName,
          email: email.toLowerCase(),
          phone,
          password: 'temporary', // Will be updated when user sets their password
          streetAddress: '',
          city: '',
          postalCode: '',
          province: '',
          country: '',
          termsAccepted: true,
          role: 'GUEST'
        }
      });
    }

    // Calculate total price
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    // Create reservation
    const reservation = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: room.id,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        numberOfGuests,
        specialRequests,
        status: 'PENDING',
        totalPrice,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: true,
        room: true
      }
    });

    // Send confirmation email
    try {
      await sendReservationEmail(reservation);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the reservation if email fails
    }

    return NextResponse.json({
      message: 'Reservation created successfully',
      reservation
    });
  } catch (error) {
    console.error('Reservation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 