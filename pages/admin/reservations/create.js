import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ReservationForm from '../../../components/reservation/ReservationForm';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';

const AdminCreateReservation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Check if user is admin
  React.useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/login');
      return;
    }

    // Fetch available rooms
    // This would typically be an API call
    setRooms([
      { id: '1', name: 'Deluxe Room', price: 199 },
      { id: '2', name: 'Executive Suite', price: 299 },
      { id: '3', name: 'Presidential Suite', price: 499 }
    ]);
  }, [user, router]);

  const handleRoomSelect = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    setSelectedRoom(room);
  };

  const handleReservationComplete = async (reservation) => {
    try {
      // Here you would typically make an API call to create the reservation
      showNotification('Reservation created successfully!', 'success');
      router.push('/admin/reservations');
    } catch (error) {
      showNotification('Failed to create reservation', 'error');
    }
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Reservation</h1>
          <p className="mt-2 text-gray-600">
            Create a reservation on behalf of a guest
          </p>
        </div>

        {!selectedRoom ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Select Room</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room.id)}
                  className="p-4 border rounded-lg hover:border-amber-500 transition-colors"
                >
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-amber-500">${room.price}/night</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Creating reservation for {selectedRoom.name}
              </h2>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Change Room
              </button>
            </div>
            <ReservationForm
              room={selectedRoom}
              onReservationComplete={handleReservationComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCreateReservation; 