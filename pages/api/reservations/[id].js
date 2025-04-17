import { verifyToken } from '../../../utils/auth';
import fs from 'fs';
import path from 'path';
import { sendCancellationEmail } from '../../../utils/emailService';

const RESERVATIONS_FILE = path.join(process.cwd(), 'data', 'reservations.json');
const ROOMS_FILE = path.join(process.cwd(), 'data', 'rooms.json');

export default async function handler(req, res) {
  // Handle CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify the user's token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Read reservations from file
    const reservationsData = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
    const reservations = JSON.parse(reservationsData);

    // Find the reservation
    const reservationIndex = reservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if the reservation belongs to the user
    if (reservations[reservationIndex].userId !== decoded.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Remove the reservation
    reservations.splice(reservationIndex, 1);

    // Save the updated reservations
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));

    return res.status(200).json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error in cancel reservation API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
