import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

// API endpoint for listing all rooms and creating new rooms
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

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getRooms(req, res);
    case 'POST':
      return createRoom(req, res);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// Get all rooms with pagination and filtering
async function getRooms(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      search,
      sortBy = 'roomNumber',
      sortOrder = 'asc'
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get rooms with pagination
    const rooms = await prisma.room.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc'
      }
    });

    // Get total count for pagination
    const totalRooms = await prisma.room.count({ where });
    const totalPages = Math.ceil(totalRooms / limitNum);

    return res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: totalRooms,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Create a new room
async function createRoom(req, res) {
  try {
    const { 
      roomNumber, 
      type, 
      price, 
      description = '', 
      image = '', 
      images = '',
      amenities = '',
      status = 'AVAILABLE'
    } = req.body;

    // Validate required fields
    if (!roomNumber) {
      return res.status(400).json({ success: false, message: 'Room number is required' });
    }

    if (!type) {
      return res.status(400).json({ success: false, message: 'Room type is required' });
    }

    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    // Check if room with this number already exists
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber }
    });

    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'Room with this number already exists' });
    }

    // Create new room
    const newRoom = await prisma.room.create({
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

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: newRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}