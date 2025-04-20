import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNotification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({
    status: 'ALL',
    type: 'ALL',
    date: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState({
    decision: '',
    comment: '',
    discount: 0
  });

  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    totalUsers: 0,
    activeUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    maintenanceMode: false,
    maxBookingsPerUser: 5,
    cancellationPolicy: '24 hours',
    checkInTime: '14:00',
    checkOutTime: '12:00'
  });

  const [discountCodes, setDiscountCodes] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    code: '',
    discountType: 'PERCENTAGE', // or 'FIXED'
    value: 0,
    minBookingAmount: 0,
    maxDiscount: 0,
    validFrom: '',
    validUntil: '',
    usageLimit: 0,
    isActive: true
  });

  // Add report state variables
  const [selectedReportType, setSelectedReportType] = useState('bookings');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchRequests();
    fetchDashboardData();
    fetchBookings();
    fetchUsers();
    fetchDiscountCodes();
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      addNotification(error.message || 'Error fetching requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [statsRes, bookingsRes, usersRes, revenueRes, occupancyRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/recent-bookings', { headers }),
        fetch('/api/admin/recent-users', { headers }),
        fetch('/api/admin/revenue-data', { headers }),
        fetch('/api/admin/occupancy-data', { headers })
      ]);

      if (!statsRes.ok || !bookingsRes.ok || !usersRes.ok || !revenueRes.ok || !occupancyRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, bookingsData, usersData, revenueData, occupancyData] = await Promise.all([
        statsRes.json(),
        bookingsRes.json(),
        usersRes.json(),
        revenueRes.json(),
        occupancyRes.json()
      ]);

      setStats(statsData);
      setRecentBookings(bookingsData);
      setRecentUsers(usersData);
      setRevenueData(revenueData);
      setOccupancyData(occupancyData);
    } catch (error) {
      addNotification(error.message || 'Error fetching dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleApproveRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          adminId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      addNotification('Request approved successfully', 'success');
      setShowApprovalModal(false);
      fetchRequests();
    } catch (error) {
      addNotification(error.message || 'Error approving request', 'error');
    }
  };

  const handleRejectRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          adminId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      addNotification('Request rejected successfully', 'success');
      setShowApprovalModal(false);
      fetchRequests();
    } catch (error) {
      addNotification(error.message || 'Error rejecting request', 'error');
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          adminId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      addNotification('Status updated successfully', 'success');
      fetchRequests();
    } catch (error) {
      addNotification(error.message || 'Error updating status', 'error');
    }
  };

  // Bookings CRUD
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      addNotification(error.message || 'Error fetching bookings', 'error');
    }
  };

  const handleUpdateBooking = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      addNotification('Booking updated successfully', 'success');
      fetchBookings();
    } catch (error) {
      addNotification(error.message || 'Error updating booking', 'error');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      addNotification('Booking deleted successfully', 'success');
      fetchBookings();
    } catch (error) {
      addNotification(error.message || 'Error deleting booking', 'error');
    }
  };

  // Users CRUD
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      addNotification(error.message || 'Error fetching users', 'error');
    }
  };

  const handleUpdateUser = async (userId, data) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      addNotification('User updated successfully', 'success');
      fetchUsers();
    } catch (error) {
      addNotification(error.message || 'Error updating user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      addNotification('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      addNotification(error.message || 'Error deleting user', 'error');
    }
  };

  // Reports
  const generateReport = async (type, startDate, endDate) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, startDate, endDate })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReports(prev => [...prev, data]);
      addNotification('Report generated successfully', 'success');
    } catch (error) {
      addNotification(error.message || 'Error generating report', 'error');
    }
  };

  // Settings
  const updateSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSettings(newSettings);
      addNotification('Settings updated successfully', 'success');
    } catch (error) {
      addNotification(error.message || 'Error updating settings', 'error');
    }
  };

  // Discount Codes CRUD
  const fetchDiscountCodes = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/discount-codes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discount codes');
      }

      const data = await response.json();
      setDiscountCodes(data);
    } catch (error) {
      addNotification(error.message || 'Error fetching discount codes', 'error');
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(discountForm)
      });

      if (!response.ok) {
        throw new Error('Failed to create discount code');
      }

      addNotification('Discount code created successfully', 'success');
      setShowDiscountModal(false);
      setDiscountForm({
        code: '',
        discountType: 'PERCENTAGE',
        value: 0,
        minBookingAmount: 0,
        maxDiscount: 0,
        validFrom: '',
        validUntil: '',
        usageLimit: 0,
        isActive: true
      });
      fetchDiscountCodes();
    } catch (error) {
      addNotification(error.message || 'Error creating discount code', 'error');
    }
  };

  const handleUpdateDiscount = async (codeId, data) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update discount code');
      }

      addNotification('Discount code updated successfully', 'success');
      fetchDiscountCodes();
    } catch (error) {
      addNotification(error.message || 'Error updating discount code', 'error');
    }
  };

  const handleDeleteDiscount = async (codeId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete discount code');
      }

      addNotification('Discount code deleted successfully', 'success');
      fetchDiscountCodes();
    } catch (error) {
      addNotification(error.message || 'Error deleting discount code', 'error');
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bookings</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold">{stats.totalBookings}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Bookings</p>
            <p className="text-2xl font-bold">{stats.activeBookings}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Occupancy Rate</p>
            <p className="text-2xl font-bold">{stats.occupancyRate}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Users</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Occupancy Rate</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={occupancyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {occupancyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Guest</th>
                <th className="px-4 py-2 text-left">Room</th>
                <th className="px-4 py-2 text-left">Check-in</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="px-4 py-2">{booking.id}</td>
                  <td className="px-4 py-2">{booking.guestName}</td>
                  <td className="px-4 py-2">{booking.roomType}</td>
                  <td className="px-4 py-2">{format(new Date(booking.checkIn), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {user.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Booking Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Guest</th>
              <th className="px-4 py-2 text-left">Room</th>
              <th className="px-4 py-2 text-left">Check-in</th>
              <th className="px-4 py-2 text-left">Check-out</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <td className="px-4 py-2">{booking.id}</td>
                <td className="px-4 py-2">{booking.guestName}</td>
                <td className="px-4 py-2">{booking.roomType}</td>
                <td className="px-4 py-2">{format(new Date(booking.checkIn), 'MMM d, yyyy')}</td>
                <td className="px-4 py-2">{format(new Date(booking.checkOut), 'MMM d, yyyy')}</td>
                <td className="px-4 py-2">
                  <select
                    value={booking.status}
                    onChange={(e) => handleUpdateBooking(booking.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Reports & Analytics</h2>
      <div className="mb-4">
        <select
          className="border rounded px-4 py-2 mr-2"
          onChange={(e) => setSelectedReportType(e.target.value)}
        >
          <option value="bookings">Bookings Report</option>
          <option value="revenue">Revenue Report</option>
          <option value="users">Users Report</option>
        </select>
        <input
          type="date"
          className="border rounded px-4 py-2 mr-2"
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-4 py-2 mr-2"
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={() => generateReport(selectedReportType, startDate, endDate)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Report
        </button>
      </div>
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div key={index} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{report.type} Report</h3>
            <p>Period: {report.startDate} to {report.endDate}</p>
            <pre className="mt-2 bg-gray-100 p-2 rounded">
              {JSON.stringify(report.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">System Settings</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          updateSettings(settings);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Notifications
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="ml-2"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maintenance Mode
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="ml-2"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Bookings Per User
                <input
                  type="number"
                  value={settings.maxBookingsPerUser}
                  onChange={(e) => setSettings({ ...settings, maxBookingsPerUser: parseInt(e.target.value) })}
                  className="ml-2 border rounded px-2 py-1"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cancellation Policy (hours)
                <input
                  type="text"
                  value={settings.cancellationPolicy}
                  onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
                  className="ml-2 border rounded px-2 py-1"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Check-in Time
                <input
                  type="time"
                  value={settings.checkInTime}
                  onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                  className="ml-2 border rounded px-2 py-1"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Check-out Time
                <input
                  type="time"
                  value={settings.checkOutTime}
                  onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                  className="ml-2 border rounded px-2 py-1"
                />
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Discount Codes</h2>
          <button
            onClick={() => setShowDiscountModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Discount Code
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Value</th>
                <th className="px-4 py-2 text-left">Valid From</th>
                <th className="px-4 py-2 text-left">Valid Until</th>
                <th className="px-4 py-2 text-left">Usage Limit</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((code) => (
                <tr key={code.id} className="border-t">
                  <td className="px-4 py-2">{code.code}</td>
                  <td className="px-4 py-2">{code.discountType}</td>
                  <td className="px-4 py-2">
                    {code.discountType === 'PERCENTAGE' ? `${code.value}%` : `$${code.value}`}
                  </td>
                  <td className="px-4 py-2">{format(new Date(code.validFrom), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-2">{format(new Date(code.validUntil), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-2">{code.usageLimit}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleUpdateDiscount(code.id, { isActive: !code.isActive })}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDeleteDiscount(code.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Code Creation Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Discount Code</h3>
            <form onSubmit={handleCreateDiscount}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code
                    <input
                      type="text"
                      value={discountForm.code}
                      onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Type
                    <select
                      value={discountForm.discountType}
                      onChange={(e) => setDiscountForm({ ...discountForm, discountType: e.target.value })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Value
                    <input
                      type="number"
                      value={discountForm.value}
                      onChange={(e) => setDiscountForm({ ...discountForm, value: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Booking Amount
                    <input
                      type="number"
                      value={discountForm.minBookingAmount}
                      onChange={(e) => setDiscountForm({ ...discountForm, minBookingAmount: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Discount
                    <input
                      type="number"
                      value={discountForm.maxDiscount}
                      onChange={(e) => setDiscountForm({ ...discountForm, maxDiscount: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valid From
                    <input
                      type="date"
                      value={discountForm.validFrom}
                      onChange={(e) => setDiscountForm({ ...discountForm, validFrom: e.target.value })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valid Until
                    <input
                      type="date"
                      value={discountForm.validUntil}
                      onChange={(e) => setDiscountForm({ ...discountForm, validUntil: e.target.value })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usage Limit
                    <input
                      type="number"
                      value={discountForm.usageLimit}
                      onChange={(e) => setDiscountForm({ ...discountForm, usageLimit: parseInt(e.target.value) })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowDiscountModal(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => fetchDashboardData()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'bookings', 'users', 'reports', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`${selectedTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && renderOverview()}
      {selectedTab === 'bookings' && renderBookings()}
      {selectedTab === 'users' && renderUsers()}
      {selectedTab === 'reports' && renderReports()}
      {selectedTab === 'settings' && renderSettings()}
    </div>
  );
};

export default AdminDashboard; 