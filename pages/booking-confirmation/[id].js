import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Link from 'next/link';
import EmailPreview from '../../components/notifications/EmailPreview';

const BookingConfirmation = () => {
    const router = useRouter();
    const { id, payment_intent, payment_intent_client_secret, redirect_status } = router.query;
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);

    useEffect(() => {
        async function confirmPayment() {
            if (!id || !payment_intent || redirect_status !== 'succeeded' || !booking) return;

            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Save payment transaction
                const response = await fetch(`/api/reservations/${id}/confirm-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        paymentIntentId: payment_intent,
                        paymentAmount: booking.totalPrice
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to confirm payment');
                }

                const data = await response.json();
                if (data.emailDetails?.previewUrl) {
                    setEmailPreviewUrl(data.emailDetails.previewUrl);
                }
            } catch (error) {
                console.error('Error confirming payment:', error);
                addNotification(error.message || 'Failed to confirm payment', 'error');
            } finally {
                setIsProcessing(false);
            }
        }

        async function fetchBookingDetails() {
            if (!id || !user) return;

            try {
                setIsLoading(true);
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`/api/reservations/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch booking details');
                }

                const data = await response.json();
                setBooking(data);

                // After fetching booking details, confirm payment if needed
                if (redirect_status === 'succeeded' && !isProcessing) {
                    setIsProcessing(true);
                    await confirmPayment();
                }
            } catch (error) {
                console.error('Error fetching booking details:', error);
                addNotification(error.message || 'Failed to load booking details', 'error');
            } finally {
                setIsLoading(false);
            }
        }

        fetchBookingDetails();
    }, [id, user, payment_intent, redirect_status, addNotification, isProcessing]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find the booking details you're looking for.</p>
                    <Link href="/my-reservations" className="text-blue-600 hover:text-blue-800">
                        View My Reservations
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F4F0]">
            <Head>
                <title>Booking Confirmation - Best Garden Hotel</title>
                <meta name="description" content="Your booking confirmation details" />
            </Head>

            <main className="container mx-auto px-4 py-8">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="bg-green-100 rounded-full p-3 inline-block mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                        <p className="text-gray-600">Thank you for choosing Best Garden Hotel</p>
                    </div>

                    <div className="border-t border-b py-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Confirmation Number</p>
                                <p className="font-semibold">{booking.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Room Type</p>
                                <p className="font-semibold">{booking.room.type}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Check-in</p>
                                <p className="font-semibold">
                                    {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Check-out</p>
                                <p className="font-semibold">
                                    {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <p className="text-gray-600">
                            A confirmation email has been sent to your email address.
                        </p>
                        <div className="space-x-4">
                            <Link href="/my-reservations" className="inline-block px-6 py-2 bg-[#1B2C42] text-white rounded-md hover:bg-opacity-90">
                                View My Reservations
                            </Link>
                            <Link href="/" className="inline-block px-6 py-2 border border-[#1B2C42] text-[#1B2C42] rounded-md hover:bg-gray-50">
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {emailPreviewUrl && (
                <EmailPreview
                    previewUrl={emailPreviewUrl}
                    onClose={() => setEmailPreviewUrl(null)}
                />
            )}
        </div>
    );
};

export default BookingConfirmation; 