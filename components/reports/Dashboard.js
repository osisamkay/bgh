import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
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
  ResponsiveContainer
} from 'recharts';
import { useNotification } from '@/context/NotificationContext';

export default function ReportDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('BOOKING');
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: '',
    type: '',
    roomType: '',
    paymentMethod: '',
    staffMember: ''
  });
  const [savedFilters, setSavedFilters] = useState([]);
  const [exportFormat, setExportFormat] = useState('');
  const [email, setEmail] = useState('');
  const [schedule, setSchedule] = useState({
    frequency: '',
    dayOfWeek: '',
    dayOfMonth: ''
  });

  useEffect(() => {
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      router.push('/login');
    }
    loadSavedFilters();
  }, [session]);

  const loadSavedFilters = async () => {
    try {
      const response = await fetch('/api/reports/filters');
      const data = await response.json();
      setSavedFilters(data);
    } catch (error) {
      showNotification('Error loading saved filters', 'error');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const saveFilter = async () => {
    try {
      const response = await fetch('/api/reports/filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Filter ${savedFilters.length + 1}`,
          filters
        })
      });
      const data = await response.json();
      setSavedFilters(prev => [...prev, data]);
      showNotification('Filter saved successfully', 'success');
    } catch (error) {
      showNotification('Error saving filter', 'error');
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType,
          filters,
          format: exportFormat,
          email,
          schedule: schedule.frequency ? schedule : null
        })
      });
      const data = await response.json();
      setReportData(data);
      showNotification('Report generated successfully', 'success');
    } catch (error) {
      showNotification('Error generating report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'BOOKING':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={Object.entries(reportData.byStatus)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="0" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="1" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'OCCUPANCY':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData.occupancyByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="occupancy" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'REVENUE':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={Object.entries(reportData.byPaymentMethod)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="0" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="1" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'TREND':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData.bookingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        <div className="flex space-x-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="BOOKING">Booking Report</option>
            <option value="OCCUPANCY">Occupancy Report</option>
            <option value="REVENUE">Revenue Report</option>
            <option value="TREND">Trend Report</option>
          </select>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>
            {reportType === 'BOOKING' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">All</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Type</label>
                  <select
                    name="roomType"
                    value={filters.roomType}
                    onChange={handleFilterChange}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">All</option>
                    <option value="STANDARD">Standard</option>
                    <option value="DELUXE">Deluxe</option>
                    <option value="SUITE">Suite</option>
                  </select>
                </div>
              </>
            )}
            {reportType === 'REVENUE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={filters.paymentMethod}
                  onChange={handleFilterChange}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">All</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
            )}
            <button
              onClick={saveFilter}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
            >
              Save Filter
            </button>
          </div>
        </div>

        {/* Export & Schedule Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Export & Schedule</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Select Format</option>
                <option value="PDF">PDF</option>
                <option value="EXCEL">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="Enter email for report delivery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule</label>
              <select
                value={schedule.frequency}
                onChange={(e) => setSchedule(prev => ({ ...prev, frequency: e.target.value }))}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">No Schedule</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>
            {schedule.frequency === 'WEEKLY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                <select
                  value={schedule.dayOfWeek}
                  onChange={(e) => setSchedule(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="MONDAY">Monday</option>
                  <option value="TUESDAY">Tuesday</option>
                  <option value="WEDNESDAY">Wednesday</option>
                  <option value="THURSDAY">Thursday</option>
                  <option value="FRIDAY">Friday</option>
                </select>
              </div>
            )}
            {schedule.frequency === 'MONTHLY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Day of Month</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={schedule.dayOfMonth}
                  onChange={(e) => setSchedule(prev => ({ ...prev, dayOfMonth: e.target.value }))}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Saved Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Saved Filters</h2>
          <div className="space-y-2">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
              >
                <span>{filter.name}</span>
                <button
                  onClick={() => setFilters(JSON.parse(filter.filters))}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Visualization */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Report Visualization</h2>
        {renderChart()}
      </div>
    </div>
  );
} 