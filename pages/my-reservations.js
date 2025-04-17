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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      addNotification('Failed to load reservations', 'error');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>My Reservations - Best Garden Hotel</title>
        <meta name="description" content="View and manage your reservations at Best Garden Hotel" />
      </Head>

      

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reservations</h1>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">You don't have any reservations yet.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-[#1a2b3b] text-white rounded hover:bg-[#2c3e50] transition-colors"
            >
              Make a Reservation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {reservation.roomType}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                      <span className="text-gray-600">
                        Reservation ID: {reservation.id}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      <p>Check-in: {new Date(reservation.checkIn).toLocaleDateString()}</p>
                      <p>Check-out: {new Date(reservation.checkOut).toLocaleDateString()}</p>
                      <p>Guests: {reservation.guests}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push(`/reservation-confirmation/${reservation.id}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                    {reservation.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      
    </div>
  );
} 