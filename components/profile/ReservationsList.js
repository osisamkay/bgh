import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const ReservationsList = () => {
  const { showNotification } = useNotification();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations/user');
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel reservation');
      }

      showNotification('Reservation cancelled successfully', 'success');
      fetchReservations();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div>Loading reservations...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">My Reservations</h2>
      
      {reservations.length === 0 ? (
        <p className="text-gray-500">You have no reservations.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Reservation ID</p>
                  <p className="font-medium">{reservation.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Room Type</p>
                  <p className="font-medium">{reservation.room.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Check-in Date</p>
                  <p className="font-medium">{formatDate(reservation.checkInDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Check-out Date</p>
                  <p className="font-medium">{formatDate(reservation.checkOutDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className={`font-medium ${
                    reservation.status === 'CONFIRMED' ? 'text-green-600' :
                    reservation.status === 'CANCELLED' ? 'text-red-600' :
                    'text-amber-600'
                  }`}>
                    {reservation.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Price</p>
                  <p className="font-medium">${reservation.totalPrice}</p>
                </div>
              </div>

              {reservation.status === 'CONFIRMED' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleCancel(reservation.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsList; 