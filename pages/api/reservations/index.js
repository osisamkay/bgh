import { getReservations, createReservation } from '../../../utils/reservationUtils';

export default function handler(req, res) {
  // Handle CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET request (retrieve all reservations)
  if (req.method === 'GET') {
    const data = getReservations();
    return res.status(200).json(data);
  }

  // Handle POST request (create a new reservation)
  if (req.method === 'POST') {
    try {
      const reservation = req.body;
      
      // Basic validation
      if (!reservation.fullName || !reservation.email || !reservation.phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const newReservation = createReservation(reservation);
      
      if (newReservation) {
        return res.status(201).json(newReservation);
      } else {
        return res.status(500).json({ error: 'Failed to create reservation' });
      }
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // If the request method is not supported
  return res.status(405).json({ error: 'Method not allowed' });
}
