// components/ErrorDisplay.js
import React from 'react';

const ErrorDisplay = ({ error, onRetry }) => {
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error?.message || 'An unexpected error occurred'}</span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
                >
                    Retry
                </button>
            )}
        </div>
    );
};

export default ErrorDisplay;