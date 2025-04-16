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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      fullName,
      email,
      phoneNumber,
      checkInDate,
      checkOutDate,
      guests,
      specialRequests,
      roomId,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !checkInDate || !checkOutDate || !guests || !roomId) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          fullName: !fullName ? 'Full name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          phoneNumber: !phoneNumber ? 'Phone number is required' : undefined,
          checkInDate: !checkInDate ? 'Check-in date is required' : undefined,
          checkOutDate: !checkOutDate ? 'Check-out date is required' : undefined,
          guests: !guests ? 'Number of guests is required' : undefined,
          roomId: !roomId ? 'Room ID is required' : undefined,
        }
      });
    }

    // Read rooms data
    const roomsContent = fs.readFileSync(ROOMS_FILE, 'utf8');
    const roomsData = JSON.parse(roomsContent);
    const room = roomsData.rooms.find(r => r.id === parseInt(roomId));

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check room availability
    const reservationsContent = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
    const reservationsData = JSON.parse(reservationsContent);
    const existingReservations = reservationsData.reservations || [];

    const isRoomBooked = existingReservations.some(reservation => {
      const reservationCheckIn = new Date(reservation.checkInDate);
      const reservationCheckOut = new Date(reservation.checkOutDate);
      const newCheckIn = new Date(checkInDate);
      const newCheckOut = new Date(checkOutDate);

      return (
        reservation.roomId === roomId &&
        !(newCheckOut <= reservationCheckIn || newCheckIn >= reservationCheckOut)
      );
    });

    if (isRoomBooked) {
      return res.status(409).json({ 
        message: 'Room is not available for the selected dates',
        details: 'Please try different dates or another room'
      });
    }

    // Create new reservation
    const newReservation = {
      id: uuidv4(),
      fullName,
      email,
      phoneNumber,
      checkInDate,
      checkOutDate,
      guests,
      specialRequests: specialRequests || '',
      roomId,
      roomType: room.type,
      price: room.price,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      status: 'pending'
    };

    // Update reservations file
    const updatedReservations = {
      ...reservationsData,
      reservations: [...existingReservations, newReservation]
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