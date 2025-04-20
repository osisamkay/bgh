import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function ReservationDetails() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (id) {
            fetchReservationDetails();
        }
    }, [id, user]);

    const fetchReservationDetails = async () => {
        try {
            const response = await fetch(`/api/reservations/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reservation details');
            }

            const data = await response.json();
            setReservation(data.reservation);
        } catch (error) {
            console.error('Error fetching reservation details:', error);
            addNotification('Failed to load reservation details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async () => {
        if (!confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        try {
            const response = await fetch(`/api/reservations/${id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to cancel reservation');
            }

            const data = await response.json();
            addNotification(data.message, 'success');
            router.push('/my-reservations');
        } catch (error) {
            console.error('Error canceling reservation:', error);
            addNotification('Failed to cancel reservation', 'error');
        }
    };

    if (!user || loading) {
        return null;
    }

    if (!reservation) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Reservation Not Found</h2>
                        <p className="text-gray-600 mb-4">The reservation you're looking for doesn't exist or you don't have permission to view it.</p>
                        <button
                            onClick={() => router.push('/my-reservations')}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Back to My Reservations
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head>
                <title>Reservation Details - Best Garden Hotel</title>
                <meta name="description" content="View your reservation details" />
            </Head>

            <main className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Reservation Details</h1>
                        <button
                            onClick={() => router.push('/my-reservations')}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            ← Back to My Reservations
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {reservation.room.mainImage && (
                            <div className="relative h-64 w-full">
                                <Image
                                    src={reservation.room.mainImage}
                                    alt={reservation.room.name}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">{reservation.room.name}</h2>
                                    <p className="text-gray-600">{reservation.room.type}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                        reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {reservation.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Reservation Details</h3>
                                    <div className="space-y-2">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Check-in:</span>{' '}
                                            {new Date(reservation.checkIn).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Check-out:</span>{' '}
                                            {new Date(reservation.checkOut).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Guests:</span>{' '}
                                            {reservation.numberOfGuests}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Reservation ID:</span>{' '}
                                            {reservation.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                                    <div className="space-y-2">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Price per night:</span>{' '}
                                            ${reservation.room.pricePerNight.toFixed(2)}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Total nights:</span>{' '}
                                            {Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24))}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Total price:</span>{' '}
                                            ${reservation.totalPrice.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {reservation.specialRequests && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Requests</h3>
                                    <p className="text-gray-600">{reservation.specialRequests}</p>
                                </div>
                            )}

                            {reservation.status === 'CONFIRMED' && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleCancelReservation}
                                        className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                                    >
                                        Cancel Reservation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 