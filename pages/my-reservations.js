import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export default function MyReservations() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { addNotification } = useNotification();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      await fetchReservations();
    };

    checkAuthAndFetch();
  }, [user, router]);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations/my-reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      if (data.success) {
        setReservations(data.reservations);
      } else {
        throw new Error(data.message || 'Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
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

  const formatDate = (dateString) => {
    console.log('Raw date string:', dateString);
    if (!dateString) return '';
    const date = new Date(dateString);
    console.log('Parsed date:', date);
    if (isNaN(date.getTime())) {
      console.log('Invalid date detected');
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Head>
        <title>My Reservations - Best Garden Hotel</title>
        <meta name="description" content="View your reservations at Best Garden Hotel" />
      </Head>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
          <p className="mt-2 text-gray-600">
            {reservations.length} {reservations.length === 1 ? 'reservation' : 'reservations'} found
          </p>
        </div>
        <Link
          href="/rooms"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
        >
          Book New Stay
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Reservations Yet</h2>
          <p className="text-gray-600 mb-6">Start planning your perfect stay with us today.</p>
          <Link
            href="/rooms"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
          >
            Browse Available Rooms
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {reservations.map((reservation) => (
            console.log('Reservation dates:', {
              checkIn: reservation.checkInDate,
              checkOut: reservation.checkOutDate,
              raw: reservation
            }),
            <div
              key={reservation.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row">
                {/* <div className="w-full lg:w-1/3 relative">
                  {reservation.room?.image && reservation.room.image.startsWith('/') ? (
                    <div className="relative h-64 lg:h-full">
                      <Image
                        src={reservation.room.image}
                        alt={`Room ${reservation.room.roomNumber || 'Image'}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-64 lg:h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div> */}

                <div className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {reservation.room.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{reservation.room.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${reservation.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${reservation.room.pricePerNight} per night
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Check-in</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(reservation.checkIn)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Check-out</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(reservation.checkOut)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Guests</p>
                      <p className="font-medium text-gray-900">
                        {reservation.numberOfGuests} {reservation.numberOfGuests === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                      <p className="font-medium text-gray-900 font-mono">
                        {reservation.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => router.push(`/reservations/${reservation.id}`)}
                      className="flex items-center text-primary hover:text-primary-dark font-medium group"
                    >
                      View Details
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="flex gap-4 mt-4">
                      {reservation.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="px-6 py-3 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors duration-200"
                        >
                          Cancel Reservation
                        </button>
                      )}
                      {reservation.status === 'PENDING' && (
                        <Link
                          href={`/payment/${reservation.id}?checkIn=${encodeURIComponent(formatDate(reservation.checkIn))}&checkOut=${encodeURIComponent(formatDate(reservation.checkOut))}&guests=${reservation.numberOfGuests}`}
                          className="px-6 py-3 bg-gray-900 text-white hover:bg-primary-dark rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                          Make Payment
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
      }
    </div >
  );
} 