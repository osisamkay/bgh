import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { sendReservationEmail } from '../../utils/emailService';

const RESERVATIONS_FILE = path.join(process.cwd(), 'data', 'reservations.json');
const ROOMS_FILE = path.join(process.cwd(), 'data', 'rooms.json');

// Initialize reservations file if it doesn't exist
if (!fs.existsSync(RESERVATIONS_FILE)) {
  fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify({ reservations: [] }));
}

// Function to delete expired reservations
const deleteExpiredReservations = () => {
  try {
    const fileContent = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
    const data = JSON.parse(fileContent);
    const currentTime = new Date().getTime();

    // Filter out reservations older than 1 hour
    const updatedReservations = data.reservations.filter(reservation => {
      const reservationTime = new Date(reservation.createdAt).getTime();
      const timeDifference = currentTime - reservationTime;
      const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
      return timeDifference < ONE_HOUR;
    });

    // Update the file with filtered reservations
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify({ 
      reservations: updatedReservations 
    }, null, 2));

    return updatedReservations;
  } catch (error) {
    console.error('Error cleaning up reservations:', error);
    return null;
  }
};

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(deleteExpiredReservations, 60 * 1000); // Check every minute
}

export default async function handler(req, res) {
  // Handle CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const fileContent = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
      const data = JSON.parse(fileContent);
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error reading reservations:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullName, email, phoneNumber, specialRequests, roomId, agreeToTerms } = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !roomId) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          fullName: !fullName ? 'Full name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          phoneNumber: !phoneNumber ? 'Phone number is required' : undefined,
          roomId: !roomId ? 'Room ID is required' : undefined
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Invalid phone number format'
      });
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      return res.status(400).json({
        message: 'You must agree to the terms and conditions'
      });
    }

    // Read rooms data
    const roomsContent = fs.readFileSync(ROOMS_FILE, 'utf8');
    const roomsData = JSON.parse(roomsContent);
    const room = roomsData.rooms.find(r => r.id === parseInt(roomId));

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create new reservation
    const newReservation = {
      id: uuidv4(),
      fullName,
      email,
      phoneNumber,
      specialRequests: specialRequests || '',
      roomId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      roomType: room.type,
      price: room.price
    };

    // Update reservations file
    const reservationsContent = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
    const reservationsData = JSON.parse(reservationsContent);
    const updatedReservations = {
      ...reservationsData,
      reservations: [...(reservationsData.reservations || []), newReservation]
    };

    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(updatedReservations, null, 2));

    // Send confirmation email
    try {
      await sendReservationEmail(newReservation);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the reservation if email fails
    }

    return res.status(201).json(newReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      details: error.message 
    });
  }
} 