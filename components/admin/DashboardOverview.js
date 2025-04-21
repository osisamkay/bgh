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
        <div className="space-y-6 p-4">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Revenue Trend</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                        strokeWidth={3}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Occupancy Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Occupancy Rate</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={occupancyData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {occupancyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                        formatter={(value) => [`${value}%`, 'Percentage']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Bookings</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.guestName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.roomType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {format(new Date(booking.checkIn), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                                    ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Users</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                                    ${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
            </div>
        </div>
    );
};

export default DashboardOverview;