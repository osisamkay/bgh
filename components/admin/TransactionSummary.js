import React from 'react';
import { formatCurrency } from '@/utils/formatters';

const TransactionSummary = ({ transactions, summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white border-b border-gray-200">
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-gray-700 font-medium">Total Transactions</h4>
          <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
            {transactions.length} transactions
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(summary.totalPayments - summary.totalRefunds)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Net amount</p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-green-700 font-medium">Total Payments</h4>
          <span className="text-green-500 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
            {transactions.filter(t => t.type === 'PAYMENT').length} payments
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-green-800">
            {formatCurrency(summary.totalPayments)}
          </p>
          <p className="text-sm text-green-600 mt-1">Total received</p>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-purple-700 font-medium">Total Refunds</h4>
          <span className="text-purple-500 bg-purple-100 px-2 py-1 rounded text-xs font-semibold">
            {transactions.filter(t => t.type === 'REFUND').length} refunds
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-purple-800">
            {formatCurrency(summary.totalRefunds)}
          </p>
          <p className="text-sm text-purple-600 mt-1">Total refunded</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;