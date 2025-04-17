import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { useNotification } from '@/context/NotificationContext';

export default function FrontDeskDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    status: 'PENDING'
  });

  useEffect(() => {
    if (!session || session.user.role !== 'FRONT_DESK') {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [session, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?date=${filters.date}&name=${filters.name}&status=${filters.status}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      showNotification('Error fetching bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    router.push(`/frontdesk/checkin/${bookingId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Front Desk Dashboard</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
            </select>
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
                        Room: {booking.room.type} | Status: {booking.status}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleCheckIn(booking.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
} 