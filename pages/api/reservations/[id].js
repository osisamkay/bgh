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

  try {
    // Read the reservations file
    const reservationsContent = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
    const reservationsData = JSON.parse(reservationsContent);

    // GET request - Fetch reservation details
    if (req.method === 'GET') {
      const reservation = reservationsData.reservations.find(r => r.id === id);

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      // Check if reservation is cancelled
      if (reservation.status === 'cancelled') {
        return res.status(403).json({ 
          message: 'This reservation has been cancelled',
          status: 'cancelled'
        });
      }

      return res.status(200).json(reservation);
    }

    // DELETE request - Cancel reservation
    if (req.method === 'DELETE') {
      const reservationIndex = reservationsData.reservations.findIndex(r => r.id === id);

      if (reservationIndex === -1) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      // Update reservation status to cancelled
      reservationsData.reservations[reservationIndex] = {
        ...reservationsData.reservations[reservationIndex],
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };

      // Write back to file
      fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservationsData, null, 2));

      return res.status(200).json({ 
        message: 'Reservation cancelled successfully',
        status: 'cancelled'
      });
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Error handling reservation request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
