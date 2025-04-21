import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function CancelReservation() {
    const router = useRouter();
    const { id } = router.query;
    const [reservation, setReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reason, setReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchReservation = async () => {
            try {
                const response = await fetch(`/api/reservations/${id}`);
                if (!response.ok) {
                    throw new Error('Reservation not found');
                }
                const data = await response.json();
                setReservation(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReservation();
    }, [id]);

    const handleCancel = async (e) => {
        e.preventDefault();
        setIsCancelling(true);
        setError('');

        try {
            const response = await fetch('/api/reservations/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reservationId: id,
                    reason,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel reservation');
            }

            setSuccess(true);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="block w-full text-center bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800"
                    >
                        Return to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-green-500 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Reservation Cancelled</h1>
                    <p className="text-gray-600 mb-6">
                        Your reservation has been successfully cancelled. A confirmation email has been sent to your email address.
                    </p>
                    <Link
                        href="/"
                        className="block w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800"
                    >
                        Return to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>Cancel Reservation - Best Garden Hotel</title>
            </Head>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6">Cancel Reservation</h1>

                        {reservation && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Reservation Details</h2>
                                <div className="bg-gray-50 p-4 rounded">
                                    <p><strong>Reservation ID:</strong> {reservation.id}</p>
                                    <p><strong>Check-in:</strong> {new Date(reservation.checkInDate).toLocaleDateString()}</p>
                                    <p><strong>Check-out:</strong> {new Date(reservation.checkOutDate).toLocaleDateString()}</p>
                                    <p><strong>Room Type:</strong> {reservation.room.type}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleCancel}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Cancellation
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={isCancelling}
                                    className="w-full sm:w-1/2 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-red-400"
                                >
                                    {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                                </button>
                                <Link
                                    href="/"
                                    className="w-full sm:w-1/2 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 text-center"
                                >
                                    Go Back
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
} 