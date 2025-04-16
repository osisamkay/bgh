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

      // Read the rooms file to get room details
      const roomsContent = fs.readFileSync(ROOMS_FILE, 'utf8');
      const roomsData = JSON.parse(roomsContent);
      const room = roomsData.rooms.find(r => r.id === parseInt(reservation.roomId));

      // Combine reservation with room details
      const reservationWithDetails = {
        ...reservation,
        room: {
          type: room.type,
          images: room.images,
          price: room.price
        }
      };

      return res.status(200).json(reservationWithDetails);
    }

    // DELETE request - Cancel reservation
    if (req.method === 'DELETE') {
      const reservationIndex = reservationsData.reservations.findIndex(r => r.id === id);

      if (reservationIndex === -1) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      try {
        // Get the reason from the request body (no need to parse JSON)
        const { reason } = req.body;

        if (!reason) {
          return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        // Get the reservation before removing it
        const cancelledReservation = reservationsData.reservations[reservationIndex];

        // Add cancellation details
        const cancellationRecord = {
          ...cancelledReservation,
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason,
          status: 'cancelled'
        };

        // Remove the active reservation
        reservationsData.reservations.splice(reservationIndex, 1);

        // Add to cancellation history
        if (!reservationsData.cancellationHistory) {
          reservationsData.cancellationHistory = [];
        }
        reservationsData.cancellationHistory.push(cancellationRecord);

        // Write back to file
        fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservationsData, null, 2));

        return res.status(200).json({ 
          message: 'Reservation cancelled successfully',
          cancellation: cancellationRecord
        });
      } catch (error) {
        console.error('Error processing cancellation:', error);
        return res.status(400).json({ 
          message: 'Error processing cancellation',
          error: error.message 
        });
      }
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Error handling reservation request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
