import { useState } from 'react';
import { useNotification } from '@/context/NotificationContext';

const FrontDeskPayment = ({ reservation, onPaymentComplete }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const calculateTotal = () => {
    const subtotal = reservation?.totalPrice || 0;
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleAmountReceivedChange = (e) => {
    setAmountReceived(e.target.value);
  };

  const validatePayment = () => {
    if (paymentMethod === 'cash') {
      const amount = parseFloat(amountReceived);
      if (isNaN(amount) || amount < calculateTotal().total) {
        showNotification('Amount received must be greater than or equal to the total', 'error');
        return false;
      }
    }
    return true;
  };

  const handleProcessPayment = async () => {
    if (!validatePayment()) return;

    try {
      setLoading(true);
      const paymentData = {
        reservationId: reservation.id,
        amount: calculateTotal().total,
        paymentMethod,
        amountReceived: parseFloat(amountReceived),
        processedBy: 'front-desk', // This would be the actual staff ID in production
      };

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      showNotification('Payment processed successfully', 'success');
      onPaymentComplete();
    } catch (error) {
      showNotification('Failed to process payment', 'error');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Process Payment</h2>

      {/* Reservation Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Reservation Details</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Reservation ID:</span>
            <span>{reservation.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Guest Name:</span>
            <span>{reservation.guestName}</span>
          </div>
          <div className="flex justify-between">
            <span>Room:</span>
            <span>{reservation.room.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-in:</span>
            <span>{new Date(reservation.checkInDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out:</span>
            <span>{new Date(reservation.checkOutDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => handlePaymentMethodChange('cash')}
            className={`px-4 py-2 rounded-md ${
              paymentMethod === 'cash'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => handlePaymentMethodChange('pos')}
            className={`px-4 py-2 rounded-md ${
              paymentMethod === 'pos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            POS
          </button>
        </div>

        {paymentMethod === 'cash' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Amount Received
            </label>
            <input
              type="number"
              value={amountReceived}
              onChange={handleAmountReceivedChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter amount received"
              step="0.01"
            />
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Room Price:</span>
            <span>${calculateTotal().subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (5%):</span>
            <span>${calculateTotal().tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${calculateTotal().total.toFixed(2)}</span>
            </div>
          </div>
          {paymentMethod === 'cash' && amountReceived && (
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span>Amount Received:</span>
                <span>${parseFloat(amountReceived).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-green-600">
                <span>Change:</span>
                <span>
                  ${(parseFloat(amountReceived) - calculateTotal().total).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Payment Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowConfirmation(true)}
          disabled={loading || (paymentMethod === 'cash' && !amountReceived)}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? 'Processing...' : 'Process Payment'}
        </button>
      </div>

      {/* Payment Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Payment</h3>
            <p className="mb-6">Are you sure you want to process this payment?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontDeskPayment; 