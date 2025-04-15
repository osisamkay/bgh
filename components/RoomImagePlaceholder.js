import React from 'react';

const RoomImagePlaceholder = ({ type, className }) => {
  return (
    <div 
      className={`flex items-center justify-center bg-gray-300 ${className}`}
    >
      <div className="text-gray-600 text-center">
        <span className="block text-lg font-semibold">{type} Image</span>
        <span className="block text-sm">Room View</span>
      </div>
    </div>
  );
};

export default RoomImagePlaceholder;
