import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

// API endpoint for managing a specific room (get, update, delete)
export default async function handler(req, res) {
  try {
    // Check authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);

    // Check if user exists and is an admin
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Get room ID from request
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getRoom(id, res);
      case 'PUT':
        return updateRoom(id, req.body, res);
      case 'DELETE':
        return deleteRoom(id, res);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in room API:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Get a single room by ID
async function getRoom(id, res) {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            OR: [
              { status: 'CONFIRMED' },
              { status: 'PENDING' }
            ]
          },
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error getting room:', error);
    return res.status(500).json({ success: false, message: 'Failed to get room' });
  }
}

// Update a room
async function updateRoom(id, data, res) {
  try {
    const {
      roomNumber,
      type,
      price,
      description,
      amenities,
      image,
      images,
      status
    } = data;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // If room number is being changed, check if new number is available
    if (roomNumber && roomNumber !== existingRoom.roomNumber) {
      const roomWithNumber = await prisma.room.findUnique({
        where: { roomNumber }
      });

      if (roomWithNumber) {
        return res.status(400).json({
          success: false,
          message: 'Room number already exists'
        });
      }
    }

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...(roomNumber && { roomNumber }),
        ...(type && { type }),
        ...(price && { price: parseFloat(price) }),
        ...(description !== undefined && { description }),
        ...(amenities && { amenities: JSON.stringify(amenities) }),
        ...(image !== undefined && { image }),
        ...(images && { images: JSON.stringify(images) }),
        ...(status && { status })
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedRoom
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return res.status(500).json({ success: false, message: 'Failed to update room' });
  }
}

// Delete a room
async function deleteRoom(id, res) {
  try {
    // Check if room exists and has no active bookings
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            OR: [
              { status: 'CONFIRMED' },
              { status: 'PENDING' }
            ]
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.bookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings'
      });
    }

    // Delete room
    await prisma.room.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete room' });
  }
}