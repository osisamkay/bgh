import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';
import { sendEmail } from '@/utils/email';

const prisma = new PrismaClient();

// Cache for room availability
const roomAvailabilityCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Booking timeout duration (15 minutes)
const BOOKING_TIMEOUT = 15 * 60 * 1000;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication token is required' });
        }

        const user = await verifyToken(token);
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const {
            roomId,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            specialRequests,
            termsAccepted,
            fullName,
            email,
            phone
        } = req.body;

        // Validate required fields
        if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests || !termsAccepted) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const now = new Date();

        if (checkIn >= checkOut) {
            return res.status(400).json({ error: 'Check-out date must be after check-in date' });
        }

        if (checkIn < now) {
            return res.status(400).json({ error: 'Check-in date cannot be in the past' });
        }

        // Check room availability
        const cacheKey = `${roomId}-${checkInDate}-${checkOutDate}`;
        const cachedAvailability = roomAvailabilityCache.get(cacheKey);

        let isAvailable;
        if (cachedAvailability && (Date.now() - cachedAvailability.timestamp) < CACHE_DURATION) {
            isAvailable = cachedAvailability.isAvailable;
        } else {
            // Check for overlapping bookings
            const overlappingBookings = await prisma.booking.findMany({
                where: {
                    roomId,
                    status: {
                        in: ['confirmed', 'pending']
                    },
                    OR: [
                        {
                            checkInDate: {
                                lt: checkOutDate,
                                gte: checkInDate
                            }
                        },
                        {
                            checkOutDate: {
                                gt: checkInDate,
                                lte: checkOutDate
                            }
                        }
                    ]
                }
            });

            isAvailable = overlappingBookings.length === 0;
            roomAvailabilityCache.set(cacheKey, {
                isAvailable,
                timestamp: Date.now()
            });
        }

        if (!isAvailable) {
            return res.status(409).json({ error: 'Room is not available for the selected dates' });
        }

        // Create pending reservation with timeout
        const reservation = await prisma.booking.create({
            data: {
                roomId,
                userId: user.id,
                checkInDate,
                checkOutDate,
                numberOfGuests,
                specialRequests,
                status: 'pending',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + BOOKING_TIMEOUT),
                metadata: {
                    timeoutDuration: BOOKING_TIMEOUT,
                    retryCount: 0
                }
            },
            include: {
                room: true,
                user: true
            }
        });

        // Send confirmation email
        const emailPreviewUrl = await sendEmail({
            to: email,
            subject: 'Booking Confirmation',
            html: `
                <h2>Booking Confirmation</h2>
                <p>Dear ${fullName},</p>
                <p>Your booking has been created successfully.</p>
                <h3>Booking Details:</h3>
                <ul>
                    <li>Room Type: ${reservation.room.type}</li>
                    <li>Check-in Date: ${new Date(checkInDate).toLocaleDateString()}</li>
                    <li>Check-out Date: ${new Date(checkOutDate).toLocaleDateString()}</li>
                    <li>Number of Guests: ${numberOfGuests}</li>
                </ul>
                <p>Please complete your payment within 15 minutes to confirm your booking.</p>
            `
        });

        return res.status(201).json({
            message: 'Reservation created successfully',
            reservation,
            emailDetails: {
                previewUrl: emailPreviewUrl
            }
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        return res.status(500).json({ error: 'Failed to create reservation' });
    } finally {
        await prisma.$disconnect();
    }
} 