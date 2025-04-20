import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export default function MyReservations() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch user's reservations
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations/my-reservations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(data.reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      addNotification('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel reservation');
      }

      addNotification('Reservation cancelled successfully', 'success');
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      addNotification('Failed to cancel reservation', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Head>
        <title>My Reservations - Best Garden Hotel</title>
        <meta name="description" content="View your reservations at Best Garden Hotel" />
      </Head>

      <main className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reservations</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Reservations Found</h2>
            <p className="text-gray-600 mb-4">You haven't made any reservations yet.</p>
            <button
              onClick={() => router.push('/rooms')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Browse Rooms
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{reservation.room.name}</h3>
                      <p className="text-sm text-gray-600">{reservation.room.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {reservation.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Check-in:</span>{' '}
                      {new Date(reservation.checkIn).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Check-out:</span>{' '}
                      {new Date(reservation.checkOut).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Guests:</span>{' '}
                      {reservation.numberOfGuests}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span>{' '}
                      ${reservation.totalPrice.toFixed(2)}
                    </p>
                  </div>

                  {reservation.status === 'CONFIRMED' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => router.push(`/reservations/${reservation.id}`)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 