import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import { format, addHours, addMinutes } from 'date-fns';

export default function ReservationManager() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showModifyReservation, setShowModifyReservation] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filters, setFilters] = useState({
    status: 'ALL',
    date: new Date().toISOString().split('T')[0],
    name: ''
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
    fetchReservations();
    // Set up session timeout
    const timeout = setTimeout(() => {
      router.push('/login');
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearTimeout(timeout);
  }, [session, filters]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reservations?status=${filters.status}&date=${filters.date}&name=${filters.name}`);
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      showNotification('Error fetching reservations', 'error');
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
      if (data.available) {
        showNotification('Rooms are available!', 'success');
      } else {
        showNotification('Selected rooms are not available', 'error');
      }
      return data.available;
    } catch (error) {
      showNotification('Error checking room availability', 'error');
      return false;
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      const roomsAvailable = await handleSearchRooms();
      if (!roomsAvailable) {
        return;
      }

      const response = await fetch('/api/reservations', {
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
        showNotification('Reservation created successfully', 'success');
        setShowNewReservation(false);
        fetchReservations();
      } else {
        throw new Error('Failed to create reservation');
      }
    } catch (error) {
      showNotification('Error creating reservation', 'error');
    }
  };

  const handleModifyReservation = async (e) => {
    e.preventDefault();
    try {
      const roomsAvailable = await handleSearchRooms();
      if (!roomsAvailable) {
        return;
      }

      const response = await fetch(`/api/reservations/${selectedReservation.id}`, {
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
        showNotification('Reservation updated successfully', 'success');
        setShowModifyReservation(false);
        fetchReservations();
      } else {
        throw new Error('Failed to update reservation');
      }
    } catch (error) {
      showNotification('Error updating reservation', 'error');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: session.user.id
        }),
      });

      if (response.ok) {
        showNotification('Reservation cancelled successfully', 'success');
        fetchReservations();
      } else {
        throw new Error('Failed to cancel reservation');
      }
    } catch (error) {
      showNotification('Error cancelling reservation', 'error');
    }
  };

  const handleValidateReservation = async (reservationId) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}/validate`);
      const data = await response.json();
      
      if (data.valid) {
        showNotification('Reservation is valid', 'success');
        router.push(`/frontdesk/checkin/${reservationId}`);
      } else {
        showNotification('Reservation has expired', 'error');
      }
    } catch (error) {
      showNotification('Error validating reservation', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reservation Management</h1>
        <button
          onClick={() => setShowNewReservation(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          New Reservation
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
            <option value="EXPIRED">Expired</option>
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
          <label className="block text-sm font-medium text-gray-700">Guest Name</label>
          <input
            type="text"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search by name"
          />
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-4">Loading...</li>
          ) : reservations.length === 0 ? (
            <li className="px-4 py-4">No reservations found</li>
          ) : (
            reservations.map((reservation) => (
              <li key={reservation.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Reservation #{reservation.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reservation.user.firstName} {reservation.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(reservation.checkInDate), 'MMM d, yyyy')} - 
                      {format(new Date(reservation.checkOutDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {reservation.status}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {reservation.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setFormData({
                              firstName: reservation.user.firstName,
                              lastName: reservation.user.lastName,
                              email: reservation.user.email,
                              phone: reservation.user.phone,
                              roomType: reservation.room.type,
                              checkInDate: reservation.checkInDate,
                              checkOutDate: reservation.checkOutDate,
                              numberOfGuests: reservation.numberOfGuests,
                              numberOfRooms: 1
                            });
                            setShowModifyReservation(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {reservation.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleValidateReservation(reservation.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Validate
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* New Reservation Modal */}
      {showNewReservation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">New Reservation</h2>
            <form onSubmit={handleCreateReservation}>
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
                  onClick={() => setShowNewReservation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Reservation Modal */}
      {showModifyReservation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Modify Reservation</h2>
            <form onSubmit={handleModifyReservation}>
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
                  onClick={() => setShowModifyReservation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Update Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 