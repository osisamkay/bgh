import { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import EmailPreview from '../notifications/EmailPreview';

const CancelReservation = () => {
  const [searchType, setSearchType] = useState('id');
  const [searchValue, setSearchValue] = useState('');
  const [reason, setReason] = useState('');
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);
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
      
      // Set email preview URL if available
      if (data.emailDetails?.previewUrl) {
        setEmailPreviewUrl(data.emailDetails.previewUrl);
      }
      
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
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Cancel Reservation</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Search by:
          </label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="id">Reservation ID</option>
            <option value="email">Email</option>
          </select>
        </div>
        
        <div className="mb-4">
          <input
            type={searchType === 'email' ? 'email' : 'text'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Enter ${searchType === 'id' ? 'reservation ID' : 'email'}`}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {reservation && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Reservation Details</h3>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p><strong>ID:</strong> {reservation.id}</p>
            <p><strong>Check-in:</strong> {new Date(reservation.checkInDate).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> {new Date(reservation.checkOutDate).toLocaleDateString()}</p>
            <p><strong>Room:</strong> {reservation.room.name}</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Cancellation Reason:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows="3"
              required
            />
          </div>

          <button
            onClick={handleCancel}
            disabled={isLoading || !reason.trim()}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Reservation'}
          </button>
        </div>
      )}

      {emailPreviewUrl && (
        <EmailPreview
          previewUrl={emailPreviewUrl}
          onClose={() => setEmailPreviewUrl(null)}
        />
      )}
    </div>
  );
};

export default CancelReservation; 