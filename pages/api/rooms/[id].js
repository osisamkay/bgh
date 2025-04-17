import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    const room = await prisma.room.findUnique({
      where: {
        id: String(id)
      }
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Parse JSON strings into arrays
    const parsedRoom = {
      ...room,
      images: JSON.parse(room.images),
      amenities: JSON.parse(room.amenities)
    };

    return res.status(200).json(parsedRoom);
  } catch (error) {
    console.error('Error fetching room:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 