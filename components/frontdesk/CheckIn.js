import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import { format } from 'date-fns';

export default function CheckIn({ bookingId }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    idType: '',
    idNumber: '',
    roomNumber: '',
    specialRequests: '',
    paymentMethod: '',
    amountPaid: 0
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (!session || session.user.role !== 'FRONT_DESK') {
      router.push('/login');
      return;
    }
    fetchBooking();
  }, [session, bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      setBooking(data);
      setShowPaymentForm(!data.payment || data.payment.status !== 'COMPLETED');
    } catch (error) {
      showNotification('Error fetching booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          staffId: session.user.id
        }),
      });

      if (response.ok) {
        showNotification('Check-in successful', 'success');
        router.push('/frontdesk');
      } else {
        throw new Error('Check-in failed');
      }
    } catch (error) {
      showNotification('Error processing check-in', 'error');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Guest Check-In</h1>
      
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
            <p className="text-sm text-gray-600">Check-in Date</p>
            <p className="font-medium">{format(new Date(booking.checkInDate), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Check-out Date</p>
            <p className="font-medium">{format(new Date(booking.checkOutDate), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Room Type</p>
            <p className="font-medium">{booking.room.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-medium">${booking.totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCheckIn} className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Guest Verification</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Type</label>
            <select
              name="idType"
              value={formData.idType}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select ID Type</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVERS_LICENSE">Driver's License</option>
              <option value="NATIONAL_ID">National ID</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Number</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Room Number</label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Special Requests</label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {showPaymentForm && (
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Complete Check-in
          </button>
        </div>
      </form>
    </div>
  );
} 