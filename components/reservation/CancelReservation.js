import { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const CancelReservation = () => {
  const [searchType, setSearchType] = useState('id');
  const [searchValue, setSearchValue] = useState('');
  const [reason, setReason] = useState('');
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reservations/search?${searchType}=${searchValue}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to find reservation');
      }

      setReservation(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/reservations/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          email: reservation.email,
          reason: reason
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel reservation');
      }

      showNotification('Reservation cancelled successfully', 'success');
      setReservation(null);
      setSearchValue('');
      setReason('');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Cancel Reservation</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4 mb-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="id">Reservation ID</option>
            <option value="email">Email</option>
          </select>
          <input
            type={searchType === 'email' ? 'email' : 'text'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'email' ? 'Enter email' : 'Enter reservation ID'}
            className="flex-1 border rounded-md px-3 py-2"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {reservation && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Reservation Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600">Reservation ID</p>
              <p className="font-medium">{reservation.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Room</p>
              <p className="font-medium">{reservation.room.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Check-in</p>
              <p className="font-medium">{new Date(reservation.checkInDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Check-out</p>
              <p className="font-medium">{new Date(reservation.checkOutDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Reason for Cancellation (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              rows="3"
              placeholder="Enter reason for cancellation..."
            />
          </div>

          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Reservation'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CancelReservation; 