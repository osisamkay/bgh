import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import { format } from 'date-fns';

export default function BookingManager() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showModifyBooking, setShowModifyBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [filters, setFilters] = useState({
    status: 'ALL',
    date: new Date().toISOString().split('T')[0],
    searchTerm: ''
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    numberOfRooms: 1
  });

  useEffect(() => {
    if (!session || (session.user.role !== 'FRONT_DESK' && session.user.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [session, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?status=${filters.status}&date=${filters.date}&search=${filters.searchTerm}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      showNotification('Error fetching bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchRooms = async () => {
    try {
      const response = await fetch('/api/rooms/available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomType: formData.roomType,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numberOfRooms: formData.numberOfRooms
        }),
      });
      const data = await response.json();
      setAvailableRooms(data.rooms);
      if (data.rooms.length === 0) {
        showNotification('No rooms available for the selected criteria', 'warning');
      }
    } catch (error) {
      showNotification('Error checking room availability', 'error');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      if (availableRooms.length === 0) {
        showNotification('Please check room availability first', 'warning');
        return;
      }

      const response = await fetch('/api/bookings', {
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
        showNotification('Booking created successfully', 'success');
        setShowNewBooking(false);
        fetchBookings();
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      showNotification('Error creating booking', 'error');
    }
  };

  const handleModifyBooking = async (e) => {
    e.preventDefault();
    try {
      if (!window.confirm('Are you sure you want to modify this booking?')) {
        return;
      }

      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          staffId: session.user.id
        }),
      });

      if (response.ok) {
        showNotification('Booking updated successfully', 'success');
        setShowModifyBooking(false);
        fetchBookings();
      } else {
        throw new Error('Failed to update booking');
      }
    } catch (error) {
      showNotification('Error updating booking', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      if (!window.confirm('Are you sure you want to cancel this booking?')) {
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showNotification('Booking cancelled successfully', 'success');
        fetchBookings();
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      showNotification('Error cancelling booking', 'error');
    }
  };

  const handleProcessPayment = async (bookingId, paymentDetails) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentDetails,
          staffId: session.user.id
        }),
      });

      if (response.ok) {
        showNotification('Payment processed successfully', 'success');
        fetchBookings();
      } else {
        throw new Error('Failed to process payment');
      }
    } catch (error) {
      showNotification('Error processing payment', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <button
          onClick={() => setShowNewBooking(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search by name, phone, or booking ID"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-4">Loading...</li>
          ) : bookings.length === 0 ? (
            <li className="px-4 py-4">No bookings found</li>
          ) : (
            bookings.map((booking) => (
              <li key={booking.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Booking #{booking.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.user.firstName} {booking.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.checkInDate), 'MMM d, yyyy')} - 
                      {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {booking.status}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setFormData({
                              firstName: booking.user.firstName,
                              lastName: booking.user.lastName,
                              email: booking.user.email,
                              phone: booking.user.phone,
                              roomType: booking.room.type,
                              checkInDate: booking.checkInDate,
                              checkOutDate: booking.checkOutDate,
                              numberOfGuests: booking.numberOfGuests,
                              numberOfRooms: 1
                            });
                            setShowModifyBooking(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === 'CONFIRMED' && !booking.payment && (
                      <button
                        onClick={() => handleProcessPayment(booking.id, {
                          method: 'CASH',
                          amount: booking.totalPrice
                        })}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Process Payment
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* New Booking Modal */}
      {showNewBooking && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">New Booking</h2>
            <form onSubmit={handleCreateBooking}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Type</label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Room Type</option>
                    <option value="STANDARD">Standard</option>
                    <option value="DELUXE">Deluxe</option>
                    <option value="SUITE">Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Rooms</label>
                  <input
                    type="number"
                    name="numberOfRooms"
                    value={formData.numberOfRooms}
                    onChange={handleInputChange}
                    required
                    min={1}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                  <input
                    type="number"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleInputChange}
                    required
                    min={1}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewBooking(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSearchRooms}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Check Availability
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={availableRooms.length === 0}
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Booking Modal */}
      {showModifyBooking && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Modify Booking</h2>
            <form onSubmit={handleModifyBooking}>
              {/* Similar form fields as New Booking Modal */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModifyBooking(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSearchRooms}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Check Availability
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={availableRooms.length === 0}
                >
                  Update Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 