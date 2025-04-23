import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

// API endpoint for managing a specific room (get, update, delete)
export default async function handler(req, res) {
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
}

// Get a specific room
async function getRoom(roomId, res) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Get booking information for this room
    const bookings = await prisma.booking.count({
      where: { 
        roomId,
        status: { 
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] 
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        ...room,
        activeBookings: bookings
      }
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch room details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update a room
async function updateRoom(roomId, data, res) {
  try {
    const { 
      roomNumber, 
      type, 
      price, 
      description, 
      image, 
      images,
      amenities,
      status
    } = data;

    // Validate required fields
    if (!roomNumber) {
      return res.status(400).json({ success: false, message: 'Room number is required' });
    }

    if (!type) {
      return res.status(400).json({ success: false, message: 'Room type is required' });
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    // Check if the room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!existingRoom) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if the new room number conflicts with another room
    if (roomNumber !== existingRoom.roomNumber) {
      const roomNumberExists = await prisma.room.findUnique({
        where: { roomNumber }
      });

      if (roomNumberExists) {
        return res.status(400).json({ success: false, message: 'Room with this number already exists' });
      }
    }

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        roomNumber,
        type,
        price: parseFloat(price),
        description,
        image,
        images,
        amenities,
        status
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete a room
async function deleteRoom(roomId, res) {
  try {
    // Check if the room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!existingRoom) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if room has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        roomId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN']
        }
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings',
        activeBookings
      });
    }

    // Delete room
    await prisma.room.delete({
      where: { id: roomId }
    });

    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}