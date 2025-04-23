import React from 'react';

const TransactionFilters = ({ filters, setFilters, resetFilters, applyFilters }) => {
  // Transaction type options
  const transactionTypes = [
    { value: 'ALL', label: 'All Transactions' },
    { value: 'PAYMENT', label: 'Payments' },
    { value: 'REFUND', label: 'Refunds' }
  ];

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by booking ID or user"
              className="block w-full pr-10 focus:ring-gray-500 focus:border-gray-500 sm:text-sm border-gray-300 rounded-md"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="block w-full focus:ring-gray-500 focus:border-gray-500 sm:text-sm border-gray-300 rounded-md"
          >
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            id="from"
            name="from"
            value={filters.from}
            onChange={handleFilterChange}
            className="block w-full focus:ring-gray-500 focus:border-gray-500 sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            id="to"
            name="to"
            value={filters.to}
            onChange={handleFilterChange}
            className="block w-full focus:ring-gray-500 focus:border-gray-500 sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;