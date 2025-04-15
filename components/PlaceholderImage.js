import React from 'react';

const PlaceholderImage = ({ type, className }) => {
  // Map of room types to background colors for placeholders
  const colorMap = {
    'single': '#f3f4f6',
    'twin': '#e5e7eb',
    'deluxe': '#d1d5db',
    'king-suite': '#9ca3af',
    'executive': '#6b7280',
    'family': '#4b5563',
  };

  const color = colorMap[type.toLowerCase()] || '#f3f4f6';

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ backgroundColor: color }}
    >
      <div className="text-gray-500 font-medium text-center">
        <span className="block">{type}</span>
        <span className="block text-sm">Room Image</span>
      </div>
    </div>
  );
};

export default PlaceholderImage;