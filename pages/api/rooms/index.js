import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rooms = await prisma.room.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        price: 'asc'
      }
    });

    if (!rooms) {
      return res.status(404).json({ error: 'No rooms found' });
    }

    // Parse JSON strings for images and amenities with error handling
    const parsedRooms = rooms.map(room => {
      try {
        return {
          ...room,
          images: room.images ? JSON.parse(room.images) : [],
          amenities: room.amenities ? JSON.parse(room.amenities) : []
        };
      } catch (parseError) {
        console.error('Error parsing room data:', parseError);
        return {
          ...room,
          images: [],
          amenities: []
        };
      }
    });

    return res.status(200).json(parsedRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
} 