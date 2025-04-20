// components/admin/DashboardOverview.js
import React from 'react';
import { format } from 'date-fns';
import {
    LineChart,
    Line,
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
import StatsCard from './StatsCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardOverview = ({ data }) => {
    if (!data) return null;

    const { stats, recentBookings, recentUsers, revenueData, occupancyData } = data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <StatsCard
                title="Bookings"
                stats={[
                    { label: 'Total Bookings', value: stats.totalBookings },
                    { label: 'Active Bookings', value: stats.activeBookings }
                ]}
            />

            <StatsCard
                title="Revenue"
                stats={[
                    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}` },
                    { label: 'Occupancy Rate', value: `${stats.occupancyRate}%` }
                ]}
            />

            <StatsCard
                title="Users"
                stats={[
                    { label: 'Total Users', value: stats.totalUsers },
                    { label: 'Active Users', value: stats.activeUsers }
                ]}
            />

            {/* Charts */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                        />
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
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
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
};

export default DashboardOverview;