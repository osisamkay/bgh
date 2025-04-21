// components/admin/ReportsManager.js
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { format } from 'date-fns';

const ReportsManager = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'bookings',
        startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days ago
        endDate: format(new Date(), 'yyyy-MM-dd') // today
    });
    const [error, setError] = useState(null);

    // Handle generating a report
    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');

            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate report');
            }

            const data = await response.json();
            setReports(prev => [data, ...prev]);
        } catch (err) {
            console.error('Error generating report:', err);
            setError(err.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle report download
    const handleDownload = (report) => {
        // Create a blob with the JSON data
        const blob = new Blob([JSON.stringify(report.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.type}_report_${report.startDate}_to_${report.endDate}.json`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Generate Report</h2>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleGenerateReport} className="space-y-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Report Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="bookings">Bookings Report</option>
                            <option value="revenue">Revenue Report</option>
                            <option value="users">Users Report</option>
                            <option value="occupancy">Occupancy Report</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>

                {reports.length === 0 ? (
                    <p className="text-gray-500">No reports generated yet. Use the form above to create a report.</p>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-lg capitalize">{report.type} Report</h3>
                                        <p className="text-sm text-gray-500">
                                            Period: {report.startDate} to {report.endDate}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(report)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Download
                                    </button>
                                </div>

                                <div className="mt-4 p-4 bg-gray-50 rounded overflow-auto max-h-64">
                                    <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(report.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsManager;