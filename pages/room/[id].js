import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import RoomImagePlaceholder from '../../components/RoomImagePlaceholder';
import roomsData from '../../data/rooms.json';

export default function RoomDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Mock images for the room
  const roomImages = [
    '/images/rooms/room1.jpg',
    '/images/rooms/room2.jpg',
    '/images/rooms/room3.jpg',
    '/images/rooms/room4.jpg'
  ];

  useEffect(() => {
    // Find the room by ID once the router is ready
    if (id) {
      const selectedRoom = roomsData.rooms.find(r => r.id === parseInt(id)) ||
        // Default to the deluxe room for the demo (ID 3)
        roomsData.rooms.find(r => r.id === 3);
      
      setRoom(selectedRoom);
      setIsLoading(false);
    }
  }, [id]);

  // Handle image navigation
  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? roomImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === roomImages.length - 1 ? 0 : prev + 1
    );
  };

  if (isLoading || !room) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <p className="text-lg">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{room.type} - Best Garden Hotel</title>
        <meta name="description" content={room.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Room Image Slider */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative h-96 overflow-hidden">
              {/* Room Image */}
              <RoomImagePlaceholder 
                type={room.type}
                className="absolute inset-0"
              />
              
              {/* Navigation Arrows */}
              <button 
                onClick={goToPreviousImage} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-white"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={goToNextImage} 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-white"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Image Navigation Dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {roomImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Room Details Box */}
            <div className="mt-8">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold mr-6">DELUXE ROOM</h1>
                  <div className="text-lg text-gray-600 border-l border-gray-300 pl-6">2 ADULTS</div>
                </div>
                
                <p className="mt-4 text-gray-700">
                  Spacious room featuring a separate living area, Sofa bed, and Queen size bed. Suitable for small families.
                </p>
                
                <p className="mt-6 text-2xl font-bold">$250 / night</p>
                
                <div className="mt-4">
                  <button className="text-blue-600 hover:underline">
                    Change or cancel selection
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Property Information & Amenities */}
          <div className="w-full lg:w-1/2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Property Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 mr-4 flex-shrink-0 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600">CHECK IN: 04:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 mr-4 flex-shrink-0 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600">CHECK OUT: 11:00 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 mr-4 flex-shrink-0 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">This hotel has a smoke-free policy</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 mr-4 flex-shrink-0 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div>
                    <button className="font-medium text-blue-600 hover:underline">
                      See Accessibility Features
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 mr-4 flex-shrink-0 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Pet Policy</p>
                    <p className="text-gray-600 mt-1">3rd Floor. Pets must be attended in room & waiver signed. $40+ per pet per day</p>
                    <p className="text-gray-600 mt-1">Contact hotel for details</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 mr-4 flex-shrink-0 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Parking</p>
                    <p className="text-gray-600 mt-1">Complimentary on-site parking</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Amenities Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Amenities</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Row 1 */}
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Kids eat free</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Free breakfast</span>
                </div>
                
                {/* Row 2 */}
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Fitness center</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Daily housekeeping</span>
                </div>
                
                {/* Row 3 */}
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-800">On-site parking</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Pool</span>
                </div>
                
                {/* Row 4 */}
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Smoke-free hotel</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Wi-Fi</span>
                </div>
                
                {/* Row 5 */}
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Area shuttle</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="#" className="text-blue-600 font-medium hover:underline">
                  See all amenities &gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href={`/reserve/${id}`} className="bg-gray-800 text-white py-3 px-8 rounded font-medium hover:bg-gray-700 inline-block text-center">
            RESERVE ROOM
          </Link>
          <button 
            onClick={() => {
              // For demonstration purposes, direct to the same reservation page
              router.push(`/reserve/${id}`);
            }}
            className="bg-gray-800 text-white py-3 px-8 rounded font-medium hover:bg-gray-700"
          >
            BOOK ROOM
          </button>
        </div>
      </main>

      <footer className="bg-amber-500 text-center py-4 mt-8" style={{ backgroundColor: "#d4b053" }}>
        <p className="text-white">© 2025 BGH. All rights reserved.</p>
      </footer>
    </div>
  );
}
