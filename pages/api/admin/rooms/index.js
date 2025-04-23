import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

// API endpoint for listing all rooms and creating new rooms
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

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getRooms(req, res);
      case 'POST':
        return createRoom(req, res);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in rooms API:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Get rooms with filtering and pagination
async function getRooms(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      status = '',
      sortBy = 'roomNumber',
      sortOrder = 'asc'
    } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause for filtering
    const where = {};
    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (type) where.type = type;
    if (status) where.status = status;

    // Get rooms with total count
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder.toLowerCase()
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.room.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    return res.status(500).json({ success: false, message: 'Failed to get rooms' });
  }
}

// Create a new room
async function createRoom(req, res) {
  try {
    const {
      roomNumber,
      type,
      price,
      description,
      amenities,
      image,
      images
    } = req.body;

    // Validate required fields
    if (!roomNumber || !type || !price) {
      return res.status(400).json({
        success: false,
        message: 'Room number, type, and price are required'
      });
    }

    // Check if room number already exists
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber }
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists'
      });
    }

    // Create new room
    const room = await prisma.room.create({
      data: {
        roomNumber,
        type,
        price: parseFloat(price),
        description,
        amenities: amenities ? JSON.stringify(amenities) : null,
        image,
        images: images ? JSON.stringify(images) : null,
        status: 'AVAILABLE'
      }
    });

    return res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ success: false, message: 'Failed to create room' });
  }
}