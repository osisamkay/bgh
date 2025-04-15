import React from 'react';

const RoomImagePlaceholder = ({ type, className }) => {
  // Function to get appropriate room image based on room type
  const getRoomImageUrl = (roomType) => {
    const typeStr = roomType?.toLowerCase() || '';
    
    if (typeStr.includes('single')) {
      return '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Single Room (1).jpg';
    } else if (typeStr.includes('twin')) {
      return '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Twin Room image (1).jpeg';
    } else if (typeStr.includes('deluxe')) {
      return '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Deluxe Room image (1).jpeg';
    } else if (typeStr.includes('king')) {
      return '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH King Room image (1).jpg';
    } else if (typeStr.includes('queen')) {
      return '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Queen Room Image 1.jpeg';
    } else if (typeStr.includes('double')) {
      return '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Double Room image (1).jpeg';
    } else {
      // Default image
      return '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Homepage - Hotel Lounge.webp';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img 
        src={getRoomImageUrl(type)}
        alt={`${type} Room`}
        className="w-full h-full object-cover absolute inset-0"
        onError={(e) => {
          console.error(`Failed to load image for ${type}`);
          e.target.onerror = null; // Prevent infinite retries
          e.target.src = '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Logo.jpg'; // Fallback image
        }}
      />
      <div className="h-full w-full bg-black bg-opacity-20 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center absolute inset-0 z-10">
        <span className="text-white font-medium text-shadow text-lg">{type}</span>
      </div>
    </div>
  );
};

export default RoomImagePlaceholder;