import { useState, useEffect } from 'react';
import Link from 'next/link';
import roomsData from '../data/rooms.json';

export default function RoomSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const rooms = roomsData.rooms;
  
  // Function to handle window resize and set visible count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1280) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to get current visible rooms
  const getVisibleRooms = () => {
    // Create a circular sliced array
    const start = activeIndex % rooms.length;
    const end = start + visibleCount;
    
    // If we need to wrap around to the beginning of the array
    if (end > rooms.length) {
      const firstPart = rooms.slice(start);
      const secondPart = rooms.slice(0, end - rooms.length);
      return [...firstPart, ...secondPart];
    }
    
    return rooms.slice(start, end);
  };

  const nextRoom = () => {
    setActiveIndex((activeIndex + 1) % rooms.length);
  };

  const prevRoom = () => {
    setActiveIndex((activeIndex - 1 + rooms.length) % rooms.length);
  };

  const visibleRooms = getVisibleRooms();

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16" id="rooms">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-12">ROOMS & SUITES</h2>
      
      <div className="relative px-4">
        <button 
          onClick={prevRoom}
          className="absolute left-0 sm:-left-4 top-1/2 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-lg z-10 flex items-center justify-center"
          aria-label="Previous room"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {visibleRooms.map((room, index) => (
            <div key={`${room.id}-${index}`} className="group cursor-pointer">
              <div className="h-56 sm:h-64 rounded-lg overflow-hidden relative">
                <img 
                  src={room.image}
                  alt={`${room.type}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 absolute inset-0"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite retries
                    e.target.src = '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Logo.jpg'; // Fallback image
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium text-shadow">{room.type}</span>
                      <span className="text-white font-bold">${room.price}/night</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{room.amenities.slice(0, 2).join(' • ')}</p>
                  <p className="text-sm text-gray-600">Max {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</p>
                </div>
                <Link href={`/room/${room.id}`}>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={nextRoom}
          className="absolute right-0 sm:-right-4 top-1/2 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Next room"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Pagination indicators */}
      <div className="flex justify-center mt-6">
        {Array.from({ length: Math.min(rooms.length, 8) }).map((_, index) => (
          <button 
            key={index} 
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${
              (index >= activeIndex && index < activeIndex + visibleCount) || 
              (activeIndex + visibleCount > rooms.length && index < (activeIndex + visibleCount) % rooms.length)
                ? 'bg-gray-800 scale-125' 
                : 'bg-gray-300'
            }`}
            aria-label={`Go to room ${index + 1}`}
          />
        ))}
      </div>
      
      {/* View All Rooms Button */}
      <div className="text-center mt-8">
        <Link href="/search">
          <button className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded transition-colors">
            View All Rooms
          </button>
        </Link>
      </div>
    </div>
  );
}