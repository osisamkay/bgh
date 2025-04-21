// components/admin/TransactionsManager.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import { useNotification } from '../../contexts/NotificationContext';

const TransactionsManager = () => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [refundAmount, setRefundAmount] = useState(0);
    const [refundReason, setRefundReason] = useState('');
    const [dateRange, setDateRange] = useState({
        from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
    });
    const [transactionType, setTransactionType] = useState('ALL');

    // Fetch transactions
    const {
        data: transactions,
        isLoading,
        error,
        refetch
    } = useQuery(
        ['transactions', dateRange, transactionType],
        async () => {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('Authentication required');

            const response = await fetch(
                `/api/admin/transactions?from=${dateRange.from}&to=${dateRange.to}&type=${transactionType}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch transactions');
            }

            return response.json();
        },
        {
            refetchOnWindowFocus: false
        }
    );

    // Process refund mutation
    const refundMutation = useMutation(
        async ({ paymentId, amount, reason }) => {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/admin/transactions/${paymentId}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount,
                    reason
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to process refund');
            }

            return response.json();
        },
        {
            onSuccess: () => {
                addNotification('Refund processed successfully', 'success');
                setShowRefundDialog(false);
                queryClient.invalidateQueries('transactions');
            },
            onError: (error) => {
                addNotification(error.message || 'Failed to process refund', 'error');
            }
        }
    );

    // Handle refund confirmation
    const handleRefund = () => {
        if (!selectedTransaction) return;

        refundMutation.mutate({
            paymentId: selectedTransaction.id,
            amount: parseFloat(refundAmount),
            reason: refundReason
        });
    };

    // Open refund dialog
    const openRefundDialog = (transaction) => {
        setSelectedTransaction(transaction);
        setRefundAmount(transaction.amount);
        setRefundReason('');
        setShowRefundDialog(true);
    };

    // Handle date range change
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Define table columns
    const columns = [
        {
            id: 'id',
            header: 'ID',
            accessor: (row) => row.id,
            sortable: true
        },
        {
            id: 'type',
            header: 'Type',
            accessor: (row) => row.type,
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.type === 'PAYMENT'
                    ? 'bg-green-100 text-green-800'
                    : row.type === 'REFUND'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                    {row.type}
                </span>
            ),
            sortable: true
        },
        {
            id: 'booking',
            header: 'Booking',
            accessor: (row) => row.booking?.id || '',
            cell: (row) => row.booking ? (
                <a
                    href={`/admin/bookings/${row.booking.id}`}
                    className="text-blue-600 hover:text-blue-800"
                >
                    {row.booking.id}
                </a>
            ) : 'N/A',
            sortable: true
        },
        {
            id: 'guest',
            header: 'Guest',
            accessor: (row) => row.user?.name || '',
            sortable: true
        },
        {
            id: 'amount',
            header: 'Amount',
            accessor: (row) => row.amount,
            cell: (row) => `$${row.amount.toFixed(2)}`,
            sortable: true
        },
        {
            id: 'status',
            header: 'Status',
            accessor: (row) => row.status,
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : row.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {row.status}
                </span>
            ),
            sortable: true
        },
        {
            id: 'date',
            header: 'Date',
            accessor: (row) => row.date || row.createdAt,
            cell: (row) => format(new Date(row.date || row.createdAt), 'MMM d, yyyy h:mm a'),
            sortable: true
        },
        {
            id: 'actions',
            header: 'Actions',
            accessor: () => null,
            cell: (row) => (
                row.type === 'PAYMENT' && row.status === 'COMPLETED' ? (
                    <button
                        onClick={() => openRefundDialog(row)}
                        className="text-red-600 hover:text-red-800 font-medium"
                        disabled={refundMutation.isLoading}
                    >
                        Refund
                    </button>
                ) : null
            ),
            sortable: false
        }
    ];

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Transaction Management</h2>
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
                <h2 className="text-xl font-semibold mb-4">Transaction Management</h2>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error.message || 'Failed to load transactions'}</span>
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
        <>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Transaction Management</h2>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            From Date
                        </label>
                        <input
                            type="date"
                            name="from"
                            value={dateRange.from}
                            onChange={handleDateChange}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            To Date
                        </label>
                        <input
                            type="date"
                            name="to"
                            value={dateRange.to}
                            onChange={handleDateChange}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transaction Type
                        </label>
                        <select
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="ALL">All Types</option>
                            <option value="PAYMENT">Payments</option>
                            <option value="REFUND">Refunds</option>
                        </select>
                    </div>

                    <button
                        onClick={() => refetch()}
                        className="bg-indigo-600 px-4 py-2 text-white rounded-md hover:bg-indigo-700"
                    >
                        Filter
                    </button>
                </div>

                {/* Data Table */}
                <DataTable
                    data={transactions?.data || []}
                    columns={columns}
                    pagination={true}
                    searchable={true}
                />

                {/* Transaction Summary */}
                {transactions?.summary && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-green-800">Total Payments</h3>
                            <p className="text-2xl font-bold text-green-600">${transactions.summary.totalPayments.toFixed(2)}</p>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-red-800">Total Refunds</h3>
                            <p className="text-2xl font-bold text-red-600">${transactions.summary.totalRefunds.toFixed(2)}</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800">Net Revenue</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                ${(transactions.summary.totalPayments - transactions.summary.totalRefunds).toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Refund Dialog */}
            <ConfirmDialog
                isOpen={showRefundDialog}
                title="Process Refund"
                message={
                    <div className="space-y-4">
                        <p>Are you sure you want to process a refund for this payment?</p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Refund Amount
                            </label>
                            <input
                                type="number"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                min="0.01"
                                max={selectedTransaction?.amount}
                                step="0.01"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Refund
                            </label>
                            <textarea
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                rows="3"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter reason for refund"
                                required
                            ></textarea>
                        </div>
                    </div>
                }
                confirmText="Process Refund"
                cancelText="Cancel"
                onConfirm={handleRefund}
                onCancel={() => setShowRefundDialog(false)}
                isLoading={refundMutation.isLoading}
            />
        </>
    );
};

export default TransactionsManager;