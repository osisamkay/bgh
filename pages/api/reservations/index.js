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
        // Check for authenticated user but don't require it
        let user = null;
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                user = await verifyToken(token);
            } catch (error) {
                console.warn('Invalid token provided:', error.message);
            }
        }

        const {
            roomId,
            id,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            specialRequests,
            termsAccepted,
            fullName,
            email,
            phone
        } = req.body;

        // Validate required fields - accept either roomId or id
        const actualRoomId = roomId || id;
        if (!actualRoomId || !checkInDate || !checkOutDate || !numberOfGuests || !termsAccepted) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Additional required fields for guest bookings
        if (!user && (!fullName || !email || !phone)) {
            return res.status(400).json({ error: 'Guest bookings require full name, email, and phone number' });
        }

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const now = new Date();

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        if (checkIn >= checkOut) {
            return res.status(400).json({ error: 'Check-out date must be after check-in date' });
        }

        if (checkIn < now) {
            return res.status(400).json({ error: 'Check-in date cannot be in the past' });
        }

        // Validate number of guests
        const parsedGuests = parseInt(numberOfGuests);
        if (isNaN(parsedGuests) || parsedGuests < 1) {
            return res.status(400).json({ error: 'Number of guests must be at least 1' });
        }

        // Format dates for Prisma query
        const checkInISO = checkIn.toISOString();
        const checkOutISO = checkOut.toISOString();

        // Check room availability
        const cacheKey = `${actualRoomId}-${checkInISO}-${checkOutISO}`;
        const cachedAvailability = roomAvailabilityCache.get(cacheKey);

        let isAvailable;
        if (cachedAvailability && (Date.now() - cachedAvailability.timestamp) < CACHE_DURATION) {
            isAvailable = cachedAvailability.isAvailable;
        } else {
            // Check for overlapping bookings
            const overlappingBookings = await prisma.booking.findMany({
                where: {
                    roomId: actualRoomId,
                    status: {
                        in: ['CONFIRMED', 'PENDING'] // Also fixing status values to match enum
                    },
                    OR: [
                        {
                            checkInDate: {
                                lt: checkOutISO,
                                gte: checkInISO
                            }
                        },
                        {
                            checkOutDate: {
                                gt: checkInISO,
                                lte: checkOutISO
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

        // Verify room exists
        const room = await prisma.room.findUnique({
            where: { id: actualRoomId }
        });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Calculate total price based on number of nights
        const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = room.price * numberOfNights;

        // Create or update guest user if not authenticated
        let guestUser = null;
        if (!user) {
            // Validate guest information
            if (!email?.includes('@') || !fullName?.trim() || !phone?.trim()) {
                return res.status(400).json({ error: 'Invalid guest information provided' });
            }

            try {
                // Check if guest user already exists
                guestUser = await prisma.user.findUnique({
                    where: { email: email.toLowerCase() }
                });

                // Create new guest user if doesn't exist
                if (!guestUser) {
                    guestUser = await prisma.user.create({
                        data: {
                            email: email.toLowerCase(),
                            name: fullName.trim(),
                            phone: phone.trim(),
                            role: 'GUEST',
                            password: '',
                            termsAccepted: true,
                            metadata: JSON.stringify({
                                isTemporary: true,
                                createdAt: new Date().toISOString()
                            })
                        }
                    });
                } else {
                    // Update existing guest user's information
                    guestUser = await prisma.user.update({
                        where: { email: email.toLowerCase() },
                        data: {
                            name: fullName.trim(),
                            phone: phone.trim(),
                            metadata: JSON.stringify({
                                isTemporary: true,
                                updatedAt: new Date().toISOString()
                            })
                        }
                    });
                }
            } catch (error) {
                console.error('Error handling guest user:', error);
                return res.status(500).json({ error: 'Failed to process guest information' });
            }
        }

        // Create pending reservation
        try {
            const reservation = await prisma.booking.create({
                data: {
                    roomId: actualRoomId,
                    userId: user?.id || guestUser.id,
                    checkInDate: checkInISO,
                    checkOutDate: checkOutISO,
                    numberOfGuests: parsedGuests,
                    specialRequests: specialRequests?.trim() || '',
                    status: 'PENDING',
                    totalPrice
                },
                include: {
                    room: true,
                    user: true
                }
            });

            // Send confirmation email
            try {
                const emailResult = await sendEmail({
                    to: email || user.email,
                    subject: 'Booking Confirmation',
                    html: `
                        <h2>Booking Confirmation</h2>
                        <p>Dear ${fullName || user.name},</p>
                        <p>Your booking has been created successfully.</p>
                        <h3>Booking Details:</h3>
                        <ul>
                            <li>Room Type: ${reservation.room.type}</li>
                            <li>Room Number: ${reservation.room.roomNumber}</li>
                            <li>Check-in Date: ${new Date(checkInDate).toLocaleDateString()}</li>
                            <li>Check-out Date: ${new Date(checkOutDate).toLocaleDateString()}</li>
                            <li>Number of Guests: ${parsedGuests}</li>
                            <li>Total Price: $${totalPrice.toFixed(2)}</li>
                            <li>Duration: ${numberOfNights} night${numberOfNights > 1 ? 's' : ''}</li>
                        </ul>
                        <p>Please complete your payment within 15 minutes to confirm your booking.</p>
                        ${!user ? '<p><strong>Note:</strong> A temporary guest account has been created for your booking.</p>' : ''}
                    `
                });

                return res.status(201).json({
                    message: 'Reservation created successfully',
                    reservation,
                    emailDetails: {
                        success: emailResult.success,
                        previewUrl: emailResult.previewUrl,
                        messageId: emailResult.messageId
                    }
                });
            } catch (error) {
                console.error('Error sending email:', error);
                // Still return success even if email fails
                return res.status(201).json({
                    message: 'Reservation created successfully, but confirmation email could not be sent',
                    reservation,
                    emailDetails: {
                        success: false,
                        error: error.message
                    }
                });
            }
        } catch (error) {
            console.error('Error creating reservation:', error);
            return res.status(500).json({
                error: 'Failed to create reservation',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Error creating reservation:', error);
        return res.status(500).json({
            error: 'Failed to create reservation',
            details: error.message,
            code: error.code
        });
    } finally {
        await prisma.$disconnect();
    }
} 