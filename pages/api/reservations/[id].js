import { getReservationById, updateReservation, deleteReservation } from '../../../utils/reservationUtils';

export default function handler(req, res) {
  // Handle CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the reservation ID from the URL
  const { id } = req.query;

  // Handle GET request (retrieve a specific reservation)
  if (req.method === 'GET') {
    const reservation = getReservationById(id);
    
    if (reservation) {
      return res.status(200).json(reservation);
    } else {
      return res.status(404).json({ error: 'Reservation not found' });
    }
  }

  // Handle PUT request (update a reservation)
  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      const updatedReservation = updateReservation(id, updates);
      
      if (updatedReservation) {
        return res.status(200).json(updatedReservation);
      } else {
        return res.status(404).json({ error: 'Reservation not found' });
      }
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle DELETE request (delete a reservation)
  if (req.method === 'DELETE') {
    const success = deleteReservation(id);
    
    if (success) {
      return res.status(200).json({ message: 'Reservation deleted successfully' });
    } else {
      return res.status(404).json({ error: 'Reservation not found' });
    }
  }

  // If the request method is not supported
  return res.status(405).json({ error: 'Method not allowed' });
}
