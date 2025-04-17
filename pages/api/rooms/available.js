import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

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
      roomType,
      checkInDate,
      checkOutDate,
      numberOfRooms
    } = data;

    // Find available rooms that match the criteria
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
      take: numberOfRooms,
      include: {
        bookings: {
          where: {
            status: { not: 'CANCELLED' }
          }
        }
      }
    });

    // Calculate total price for each room
    const roomsWithPrice = availableRooms.map(room => {
      const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
      return {
        ...room,
        totalPrice: room.price * nights
      };
    });

    return NextResponse.json({
      available: roomsWithPrice.length >= numberOfRooms,
      rooms: roomsWithPrice
    });
  } catch (error) {
    console.error('Error checking room availability:', error);
    return NextResponse.json(
      { error: 'Failed to check room availability' },
      { status: 500 }
    );
  }
} 