import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

export const ReservationsList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    fetchReservations();
  }, [user, token]);

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
      }
    } catch (error) {
      addNotification('error', 'Failed to fetch reservations');
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      const response = await fetch(`/api/reservations/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel reservation');
      }

      const data = await response.json();
      if (data.success) {
        addNotification('success', 'Reservation cancelled successfully');
        fetchReservations();
      }
    } catch (error) {
      addNotification('error', 'Failed to cancel reservation');
      console.error('Error cancelling reservation:', error);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 mb-4" />
          <p className="text-gray-500">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view and manage your reservations.</p>
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full">
              Sign In to Your Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reservations Yet</h2>
          <p className="text-gray-600 mb-6">Ready to plan your stay? Browse our available rooms and book your perfect accommodation.</p>
          <Link href="/rooms">
            <Button variant="primary" size="lg" className="w-full">
              Browse Available Rooms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
          <p className="mt-2 text-gray-600">
            {reservations.length} {reservations.length === 1 ? 'reservation' : 'reservations'} found
          </p>
        </div>
        <Link href="/rooms">
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            Book New Stay
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 lg:w-1/4">
                {reservation.room.image ? (
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={reservation.room.image}
                      alt={`Room ${reservation.room.name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 md:h-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Room {reservation.room.name}
                      </h3>
                      <Badge color={getStatusBadgeColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{reservation.room.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${reservation.totalPrice}</p>
                    <p className="text-sm text-gray-500">
                      ${reservation.room.pricePerNight} per night
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Check-in</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(reservation.checkIn), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Check-out</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(reservation.checkOut), 'MMM dd, yyyy')}
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
                      {reservation.id.slice(0, 8)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                  <Link
                    href={`/reservations/${reservation.id}`}
                    className="text-primary hover:text-primary-dark font-medium flex items-center gap-2 group"
                  >
                    View Details
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {reservation.status.toLowerCase() === 'confirmed' && (
                    <Button
                      variant="danger"
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="w-full sm:w-auto"
                    >
                      Cancel Reservation
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ReservationsList; 