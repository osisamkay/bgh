// components/admin/DashboardHeader.js
import React from 'react';
import { ArrowPathIcon as RefreshIcon } from '@heroicons/react/24/outline';

const DashboardHeader = ({ onRefresh }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
                <button
                    onClick={onRefresh}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {/* <RefreshIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> */}
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;