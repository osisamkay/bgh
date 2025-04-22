import prisma from '@/lib/prisma';

async function verifyDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First verify database connection
    const connectionStatus = await verifyDatabaseConnection();
    if (!connectionStatus.connected) {
      console.error('Database connection failed:', connectionStatus.error);
      return res.status(500).json({
        error: 'Database connection failed',
        details: connectionStatus.error,
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
          hasPooling: Boolean(process.env.POSTGRES_URL_NON_POOLING)
        }
      });
    }

    // Attempt to fetch rooms
    const rooms = await prisma.room.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        price: 'asc'
      }
    });

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        message: 'No rooms found',
        count: 0,
        timestamp: new Date().toISOString()
      });
    }

    // Parse JSON strings for images and amenities with error handling
    const parsedRooms = rooms.map(room => {
      try {
        return {
          ...room,
          images: room.images ? JSON.parse(room.images) : [],
          amenities: room.amenities ? JSON.parse(room.amenities) : [],
          // Convert dates to ISO strings for consistent formatting
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString()
        };
      } catch (parseError) {
        console.error(`Error parsing room data for room ${room.id}:`, parseError);
        return {
          ...room,
          images: [],
          amenities: [],
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
          parseError: parseError.message
        };
      }
    });

    return res.status(200).json({
      success: true,
      count: parsedRooms.length,
      timestamp: new Date().toISOString(),
      data: parsedRooms
    });
  } catch (error) {
    console.error('Error in rooms API:', error);
    return res.status(500).json({
      error: 'Failed to fetch rooms',
      details: {
        message: error.message,
        code: error.code,
        meta: error.meta
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
        hasPooling: Boolean(process.env.POSTGRES_URL_NON_POOLING)
      },
      timestamp: new Date().toISOString()
    });
  }
} 