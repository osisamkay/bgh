import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

const CANCELLATION_REASONS = [
  'Change of plans',
  'Found better accommodation',
  'Travel restrictions',
  'Personal emergency',
  'Other'
];

const CancelBooking = ({ booking, onCancelComplete }) => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [refundDetails, setRefundDetails] = useState(null);

  useEffect(() => {
    if (booking) {
      calculateRefund();
    }
  }, [booking]);

  const calculateRefund = () => {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    let penalty = 0;
    let refundPercentage = 100;
    let applies = false;

    if (hoursUntilCheckIn <= 48) {
      penalty = booking.totalPrice * 0.3;
      refundPercentage = 70;
      applies = true;
    }

    setRefundDetails({
      penalty,
      refundAmount: booking.totalPrice - penalty,
      refundPercentage,
      penaltyApplies: applies,
      hoursUntilCheckIn: Math.floor(hoursUntilCheckIn)
    });
  };

  const handleCancelBooking = async () => {
    try {
      setLoading(true);

      const cancellationData = {
        bookingId: booking.id,
        userId: user.id,
        refundAmount: refundDetails.refundAmount,
        penalty: refundDetails.penalty,
        reason: cancellationReason === 'Other' ? customReason : cancellationReason,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancellationData),
      });

      if (!response.ok) {
        throw new Error('Cancellation failed');
      }

      showNotification('Booking cancelled successfully', 'success');
      onCancelComplete();
    } catch (error) {
      showNotification('Failed to cancel booking', 'error');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowConfirmation(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
      >
        Cancel Booking
      </button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Cancel Booking</h3>
            
            {/* Booking Details */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Booking Details</h4>
              <div className="space-y-1">
                <p>Reference: {booking.id}</p>
                <p>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                <p>Amount: ${booking.totalPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Refund Summary */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Refund Summary</h4>
              <div className="space-y-1">
                <p>Refund Amount: ${refundDetails?.refundAmount.toFixed(2)}</p>
                <p>Refund Percentage: {refundDetails?.refundPercentage}%</p>
                {refundDetails?.penaltyApplies && (
                  <p className="text-red-600">
                    Penalty: ${refundDetails?.penalty.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason (Optional)
              </label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a reason</option>
                {CANCELLATION_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              
              {cancellationReason === 'Other' && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Return to Previous Page
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {loading ? 'Processing...' : 'Proceed with Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelBooking; 