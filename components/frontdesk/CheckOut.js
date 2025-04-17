import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import { format } from 'date-fns';

export default function CheckOut({ bookingId }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [charges, setCharges] = useState([]);
  const [disputedCharges, setDisputedCharges] = useState([]);
  const [formData, setFormData] = useState({
    keyReturned: true,
    feedback: '',
    disputeNotes: '',
    paymentMethod: '',
    amountPaid: 0
  });

  useEffect(() => {
    if (!session || session.user.role !== 'FRONT_DESK') {
      router.push('/login');
      return;
    }
    fetchBookingDetails();
  }, [session, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}/checkout`);
      const data = await response.json();
      setBooking(data.booking);
      setCharges(data.charges);
    } catch (error) {
      showNotification('Error fetching booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleChargeDispute = (chargeId, isDisputed) => {
    if (isDisputed) {
      setDisputedCharges([...disputedCharges, chargeId]);
    } else {
      setDisputedCharges(disputedCharges.filter(id => id !== chargeId));
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          disputedCharges,
          staffId: session.user.id
        }),
      });

      if (response.ok) {
        showNotification('Check-out successful', 'success');
        router.push('/frontdesk');
      } else {
        throw new Error('Check-out failed');
      }
    } catch (error) {
      showNotification('Error processing check-out', 'error');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  const totalCharges = charges.reduce((sum, charge) => 
    disputedCharges.includes(charge.id) ? sum : sum + charge.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Guest Check-Out</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Booking ID</p>
            <p className="font-medium">{booking.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Guest Name</p>
            <p className="font-medium">{booking.user.firstName} {booking.user.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Room Number</p>
            <p className="font-medium">{booking.checkInDetails.roomNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Check-out Date</p>
            <p className="font-medium">{format(new Date(), 'MMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      {charges.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Additional Charges</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispute</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {charges.map((charge) => (
                  <tr key={charge.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{charge.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${charge.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(charge.date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={disputedCharges.includes(charge.id)}
                        onChange={(e) => handleChargeDispute(charge.id, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-right">
                    <span className="font-semibold">Total Charges: ${totalCharges.toFixed(2)}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <form onSubmit={handleCheckOut} className="bg-white shadow rounded-lg p-6">
        {disputedCharges.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Dispute Notes</label>
            <textarea
              name="disputeNotes"
              value={formData.disputeNotes}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Please provide details about the disputed charges..."
            />
          </div>
        )}

        {totalCharges > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Payment Method</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleInputChange}
                  required
                  min={0}
                  step={0.01}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="keyReturned"
              checked={formData.keyReturned}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Room key has been returned</span>
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Guest Feedback</label>
          <textarea
            name="feedback"
            value={formData.feedback}
            onChange={handleInputChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Please share your experience with us..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Complete Check-out
          </button>
        </div>
      </form>
    </div>
  );
} 