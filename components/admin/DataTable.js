// components/admin/DataTable.js
import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';

const DataTable = ({
    data,
    columns,
    pagination = true,
    searchable = true,
    rowsPerPageOptions = [10, 25, 50, 100],
    initialRowsPerPage = 10
}) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
    const [searchTerm, setSearchTerm] = useState('');

    // Handle sorting
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Handle searching
    const filteredData = searchTerm && searchable
        ? data.filter(item => {
            return columns.some(column => {
                const value = column.accessor(item);
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        })
        : data;

    // Handle pagination
    const paginatedData = pagination
        ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : filteredData;

    // Handle sorting
    const sortedData = sortColumn
        ? [...paginatedData].sort((a, b) => {
            const column = columns.find(col => col.id === sortColumn);
            const valueA = column.accessor(a);
            const valueB = column.accessor(b);

            if (valueA === valueB) return 0;

            if (valueA === null || valueA === undefined) return 1;
            if (valueB === null || valueB === undefined) return -1;

            const result = typeof valueA === 'string'
                ? valueA.localeCompare(valueB)
                : valueA - valueB;

            return sortDirection === 'asc' ? result : -result;
        })
        : paginatedData;

    return (
        <div className="overflow-hidden">
            {searchable && (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="px-4 py-2 border rounded-md w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.id}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable !== false ? 'cursor-pointer select-none' : ''
                                        }`}
                                    onClick={() => column.sortable !== false && handleSort(column.id)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.header}</span>
                                        {column.sortable !== false && sortColumn === column.id && (
                                            sortDirection === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4" />
                                            )
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.length > 0 ? (
                            sortedData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {columns.map((column) => (
                                        <td
                                            key={column.id}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {column.cell ? column.cell(row) : column.accessor(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <span className="text-sm text-gray-700 mr-4">
                            Rows per page:
                        </span>
                        <select
                            className="border rounded-md px-2 py-1"
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(0);
                            }}
                        >
                            {rowsPerPageOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                            {page * rowsPerPage + 1}-{Math.min(page * rowsPerPage + rowsPerPage, filteredData.length)} of {filteredData.length}
                        </span>
                        <div className="flex ml-4">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 0}
                                className="px-3 py-1 border rounded-md mr-2 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
                                className="px-3 py-1 border rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;