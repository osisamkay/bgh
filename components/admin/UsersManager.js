// components/admin/UsersManager.js
import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import { updateUser, deleteUser } from '../../services/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const UsersManager = ({ data, isLoading, error, onRefresh }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();

    // Update user mutation
    const updateMutation = useMutation(
        ({ id, data }) => updateUser(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                queryClient.invalidateQueries('dashboardData');
                addNotification('User updated successfully', 'success');
            },
            onError: (error) => {
                addNotification(error.message || 'Failed to update user', 'error');
            }
        }
    );

    // Delete user mutation
    const deleteMutation = useMutation(
        (id) => deleteUser(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                queryClient.invalidateQueries('dashboardData');
                addNotification('User deleted successfully', 'success');
                setShowDeleteDialog(false);
            },
            onError: (error) => {
                addNotification(error.message || 'Failed to delete user', 'error');
            }
        }
    );

    // Handle role change
    const handleRoleChange = (user, newRole) => {
        updateMutation.mutate({
            id: user.id,
            data: { role: newRole }
        });
    };

    // Handle delete confirmation
    const handleDelete = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser.id);
        }
    };

    // Open delete dialog
    const openDeleteDialog = (user) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    // Define columns for the data table
    const columns = [
        {
            id: 'name',
            header: 'Name',
            accessor: (row) => row.name || `${row.firstName} ${row.lastName}`.trim(),
            sortable: true
        },
        {
            id: 'email',
            header: 'Email',
            accessor: (row) => row.email,
            sortable: true
        },
        {
            id: 'role',
            header: 'Role',
            accessor: (row) => row.role,
            cell: (row) => (
                <select
                    value={row.role}
                    onChange={(e) => handleRoleChange(row, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={updateMutation.isLoading}
                >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
            ),
            sortable: true
        },
        {
            id: 'status',
            header: 'Status',
            accessor: (row) => row.emailVerified,
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {row.emailVerified ? 'Verified' : 'Unverified'}
                </span>
            ),
            sortable: true
        },
        {
            id: 'created',
            header: 'Joined',
            accessor: (row) => row.createdAt,
            cell: (row) => format(new Date(row.createdAt), 'MMM d, yyyy'),
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
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
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
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error.message || 'Failed to load users'}</span>
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
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <DataTable
                    data={data?.data || []}
                    columns={columns}
                    pagination={true}
                    searchable={true}
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.name || selectedUser?.email}? This action cannot be undone and will remove all their bookings and data.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
                isLoading={deleteMutation.isLoading}
            />
        </>
    );
};

export default UsersManager;