import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const {
      firstName,
      lastName,
      email,
      password,
      streetAddress,
      city,
      postalCode,
      province,
      country,
      termsAccepted,
      reservationId
    } = req.body;

    // Find the user
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const updateData = {
      firstName,
      lastName,
      email,
      streetAddress,
      city,
      postalCode,
      province,
      country,
      termsAccepted,
      role: 'USER' // Update role from GUEST to USER
    };

    // Only update password if it's provided and different from the current one
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = updatedUser;

    // If there's a reservationId, redirect to payment page
    if (reservationId) {
      // Get reservation details
      const reservation = await prisma.booking.findUnique({
        where: { id: reservationId },
        include: {
          room: true
        }
      });

      if (reservation) {
        // Construct payment URL with necessary parameters
        const paymentUrl = `/payment?reservationId=${reservationId}&amount=${reservation.totalPrice}&roomType=${encodeURIComponent(reservation.room.type)}&checkIn=${reservation.checkInDate}&checkOut=${reservation.checkOutDate}`;
        
        return res.status(200).json({
          message: 'User updated successfully',
          user: userWithoutPassword,
          redirectUrl: paymentUrl
        });
      }
    }

    return res.status(200).json({
      message: 'User updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
} 