// components/admin/BookingsManager.js
import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import { updateBooking, deleteBooking } from '../../services/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const BookingsManager = ({ data, isLoading, error, onRefresh }) => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();

    // Update booking mutation
    const updateMutation = useMutation(
        ({ id, data }) => updateBooking(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('bookings');
                queryClient.invalidateQueries('dashboardData');
                addNotification('Booking updated successfully', 'success');
            },
            onError: (error) => {
                addNotification(error.message || 'Failed to update booking', 'error');
            }
        }
    );

    // Delete booking mutation
    const deleteMutation = useMutation(
        (id) => deleteBooking(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('bookings');
                queryClient.invalidateQueries('dashboardData');
                addNotification('Booking deleted successfully', 'success');
                setShowDeleteDialog(false);
            },
            onError: (error) => {
                addNotification(error.message || 'Failed to delete booking', 'error');
            }
        }
    );

    // Handle status change
    const handleStatusChange = (booking, newStatus) => {
        updateMutation.mutate({
            id: booking.id,
            data: { status: newStatus }
        });
    };

    // Handle delete confirmation
    const handleDelete = () => {
        if (selectedBooking) {
            deleteMutation.mutate(selectedBooking.id);
        }
    };

    // Open delete dialog
    const openDeleteDialog = (booking) => {
        setSelectedBooking(booking);
        setShowDeleteDialog(true);
    };

    // Define columns for the data table
    const columns = [
        {
            id: 'id',
            header: 'ID',
            accessor: (row) => row.id,
            sortable: true
        },
        {
            id: 'guest',
            header: 'Guest',
            accessor: (row) => row.guestName,
            sortable: true
        },
        {
            id: 'room',
            header: 'Room',
            accessor: (row) => `${row.roomType} (${row.roomNumber})`,
            sortable: true
        },
        {
            id: 'checkIn',
            header: 'Check-in',
            accessor: (row) => row.checkIn,
            cell: (row) => format(new Date(row.checkIn), 'MMM d, yyyy'),
            sortable: true
        },
        {
            id: 'checkOut',
            header: 'Check-out',
            accessor: (row) => row.checkOut,
            cell: (row) => format(new Date(row.checkOut), 'MMM d, yyyy'),
            sortable: true
        },
        {
            id: 'status',
            header: 'Status',
            accessor: (row) => row.status,
            cell: (row) => (
                <select
                    value={row.status}
                    onChange={(e) => handleStatusChange(row, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={updateMutation.isLoading}
                >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="CHECKED_OUT">Checked Out</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            ),
            sortable: true
        },
        {
            id: 'actions',
            header: 'Actions',
            accessor: () => null,
            cell: (row) => (
                <button
                    onClick={() => openDeleteDialog(row)}
                    className="text-red-600 hover:text-red-800 font-medium"
                    disabled={deleteMutation.isLoading}
                >
                    Delete
                </button>
            ),
            sortable: false
        }
    ];

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Booking Management</h2>
                <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded w-64 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Booking Management</h2>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error.message || 'Failed to load bookings'}</span>
                    <button
                        onClick={onRefresh}
                        className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Booking Management</h2>
                <DataTable
                    data={data || []}
                    columns={columns}
                    pagination={true}
                    searchable={true}
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Delete Booking"
                message={`Are you sure you want to delete the booking for ${selectedBooking?.guestName}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
                isLoading={deleteMutation.isLoading}
            />
        </>
    );
};

export default BookingsManager;