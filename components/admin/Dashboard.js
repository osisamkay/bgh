// components/admin/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import * as adminApi from '../../services/adminApi';
import DashboardHeader from './DashboardHeader';
import DashboardTabs from './DashboardTabs';
import DashboardOverview from './DashboardOverview';
import BookingsManager from './BookingsManager';
import UsersManager from './UsersManager';
import ReportsManager from './ReportsManager';
import SettingsManager from './SettingsManager';
import LoadingSpinner from '../LoadingSpinner';
import ErrorDisplay from '../ErrorDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [user, router]);

  // Dashboard data query with React Query
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery('dashboardData', adminApi.fetchDashboardData, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Booking data query (loaded only when tab is selected)
  const {
    data: bookingsData,
    isLoading: isBookingsLoading,
    error: bookingsError,
    refetch: refetchBookings
  } = useQuery('bookings', adminApi.fetchBookings, {
    enabled: selectedTab === 'bookings',
    refetchOnWindowFocus: false,
  });

  // Users data query (loaded only when tab is selected)
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery('users', adminApi.fetchUsers, {
    enabled: selectedTab === 'users',
    refetchOnWindowFocus: false,
  });

  // Handle refresh of all data
  const handleRefreshData = useCallback(() => {
    queryClient.invalidateQueries('dashboardData');
    queryClient.invalidateQueries('bookings');
    queryClient.invalidateQueries('users');
    addNotification('Data refreshed successfully', 'success');
  }, [queryClient, addNotification]);

  // Show loading indicator while checking admin status
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader
        onRefresh={handleRefreshData}
      />

      <DashboardTabs
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        tabs={['overview', 'bookings', 'users', 'reports', 'settings']}
      />

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        isDashboardLoading ? (
          <div className="my-8">
            <DashboardSkeleton />
          </div>
        ) : dashboardError ? (
          <ErrorDisplay
            error={dashboardError}
            onRetry={refetchDashboard}
          />
        ) : (
          <DashboardOverview data={dashboardData?.data} />
        )
      )}

      {selectedTab === 'bookings' && (
        <BookingsManager
          data={bookingsData}
          isLoading={isBookingsLoading}
          error={bookingsError}
          onRefresh={refetchBookings}
        />
      )}

      {selectedTab === 'users' && (
        <UsersManager
          data={usersData}
          isLoading={isUsersLoading}
          error={usersError}
          onRefresh={refetchUsers}
        />
      )}

      {selectedTab === 'reports' && (
        <ReportsManager />
      )}

      {selectedTab === 'settings' && (
        <SettingsManager />
      )}
    </div>
  );
};

export default AdminDashboard;

// Skeleton loader component for dashboard
const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {/* Stats Cards Skeletons */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white p-6 rounded-lg shadow">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}

    {/* Charts Skeletons */}
    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded w-full"></div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded-full w-64 mx-auto"></div>
    </div>

    {/* Tables Skeletons */}
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  </div>
);