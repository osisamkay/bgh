import prisma from '@/lib/prisma';

async function verifyDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    console.error('Database connection verification failed:', error);
    return {
      connected: false,
      error: {
        message: error.message,
        code: error.code,
        meta: error.meta
      }
    };
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // First verify database connection
    const connectionStatus = await verifyDatabaseConnection();
    if (!connectionStatus.connected) {
      console.error('Database connection failed:', connectionStatus.error);
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: connectionStatus.error,
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
          hasPooling: Boolean(process.env.POSTGRES_URL_NON_POOLING)
        },
        timestamp: new Date().toISOString()
      });
    }

    // Attempt to fetch rooms with a timeout
    const roomsPromise = prisma.room.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        price: 'asc'
      }
    });

    // Add a 10-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timed out')), 10000)
    );

    const rooms = await Promise.race([roomsPromise, timeoutPromise]);

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No rooms found',
        count: 0,
        timestamp: new Date().toISOString()
      });
    }

    // Parse JSON strings for images and amenities with error handling
    const parsedRooms = rooms.map(room => {
      try {
        const parsedImages = room.images ? JSON.parse(room.images) : [];
        const parsedAmenities = room.amenities ? JSON.parse(room.amenities) : [];

        return {
          id: room.id,
          roomNumber: room.roomNumber,
          type: room.type,
          status: room.status,
          price: room.price,
          description: room.description || '',
          images: parsedImages,
          amenities: parsedAmenities,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString()
        };
      } catch (parseError) {
        console.error(`Error parsing room data for room ${room.id}:`, parseError);
        return {
          id: room.id,
          roomNumber: room.roomNumber,
          type: room.type,
          status: room.status,
          price: room.price,
          description: room.description || '',
          images: [],
          amenities: [],
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
          parseError: parseError.message
        };
      }
    });

    const response = {
      success: true,
      count: parsedRooms.length,
      timestamp: new Date().toISOString(),
      data: parsedRooms
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in rooms API:', error);

    const errorResponse = {
      success: false,
      error: 'Failed to fetch rooms',
      details: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        meta: error.meta || {}
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
        hasPooling: Boolean(process.env.POSTGRES_URL_NON_POOLING)
      },
      timestamp: new Date().toISOString()
    };

    // Set error response headers
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
} 