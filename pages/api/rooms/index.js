import { prisma } from '@/lib/prisma';

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

    // Parse amenities from JSON string
    const roomsWithParsedAmenities = rooms.map(room => ({
      ...room,
      amenities: room.amenities ? JSON.parse(room.amenities) : []
    }));

    return res.status(200).json(roomsWithParsedAmenities);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
} 