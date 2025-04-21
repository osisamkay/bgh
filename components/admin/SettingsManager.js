// components/admin/SettingsManager.js
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getSettings, updateSettings } from '../../services/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const SettingsManager = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  // Fetch settings
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery('settings', getSettings);

  const [formData, setFormData] = useState({
    emailNotifications: true,
    maintenanceMode: false,
    maxBookingsPerUser: 5,
    cancellationPolicy: '24 hours',
    checkInTime: '14:00',
    checkOutTime: '12:00'
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Update settings mutation
  const mutation = useMutation(
    (data) => updateSettings(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settings');
        addNotification('Settings updated successfully', 'success');
      },
      onError: (error) => {
        addNotification(error.message || 'Failed to update settings', 'error');
      }
    }
  );

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-full"></div>
          ))}
          <div className="h-10 bg-gray-200 rounded w-1/3 mt-6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">System Settings</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error.message || 'Failed to load settings'}</span>
          <button
            onClick={refetch}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">System Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
              Enable Email Notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              name="maintenanceMode"
              checked={formData.maintenanceMode}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
              Maintenance Mode
            </label>
          </div>

          <div>
            <label htmlFor="maxBookingsPerUser" className="block text-sm font-medium text-gray-700">
              Maximum Bookings Per User
            </label>
            <input
              type="number"
              id="maxBookingsPerUser"
              name="maxBookingsPerUser"
              min="1"
              value={formData.maxBookingsPerUser}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700">
              Cancellation Policy
            </label>
            <select
              id="cancellationPolicy"
              name="cancellationPolicy"
              value={formData.cancellationPolicy}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="12 hours">12 Hours</option>
              <option value="24 hours">24 Hours</option>
              <option value="48 hours">48 Hours</option>
              <option value="72 hours">72 Hours</option>
            </select>
          </div>

          <div>
            <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700">
              Check-in Time
            </label>
            <input
              type="time"
              id="checkInTime"
              name="checkInTime"
              value={formData.checkInTime}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700">
              Check-out Time
            </label>
            <input
              type="time"
              id="checkOutTime"
              name="checkOutTime"
              value={formData.checkOutTime}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="pt-5">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsManager;