import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Header from '../../components/Header';
import roomsData from '../../data/rooms.json';

export default function RoomDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  useEffect(() => {
    if (id) {
      const selectedRoom = roomsData.rooms.find(r => r.id === parseInt(id));
      if (selectedRoom) {
        setRoom(selectedRoom);
        setIsLoading(false);
      } else {
        router.push('/search');
      }
    }
  }, [id, router]);

  useEffect(() => {
    // Load search parameters from localStorage
    const savedParams = localStorage.getItem('searchParams');
    if (savedParams) {
      setSearchParams(JSON.parse(savedParams));
    }
  }, []);

  const handleImageNavigation = (direction) => {
    if (!room?.images) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === room.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? room.images.length - 1 : prev - 1
      );
    }
  };

  const handleChangeSelection = () => {
    // Clear search parameters from localStorage
    localStorage.removeItem('searchParams');
    router.push('/search');
  };

  if (isLoading || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
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

      

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Room Images and Details */}
          <div className="w-full lg:w-2/3">
            {/* Image Slider */}
            <div className="relative h-[400px] w-full lg:max-w-[700px] rounded-lg overflow-hidden">
              <Image
                src={room.images ? room.images[currentImageIndex] : room.image}
                alt={`${room.type} - View ${currentImageIndex + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
                priority
              />
              
              {room.images && room.images.length > 1 && (
                <>
                  <button 
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-black/75 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-black/75 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image Navigation Dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Room Details Box */}
            <div className="mt-8">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold mr-6">{room.type.toUpperCase()}</h1>
                  <div className="text-lg text-gray-600 border-l border-gray-300 pl-6">
                    {room.capacity} {room.capacity === 1 ? 'ADULT' : 'ADULTS'}
                  </div>
                </div>
                
                <p className="mt-4 text-gray-700">{room.description}</p>
                
                <p className="mt-6 text-2xl font-bold">${room.price} / night</p>
                
                <div className="mt-4">
                  <button 
                    onClick={handleChangeSelection}
                    className="text-blue-600 hover:underline"
                  >
                    Change or cancel selection
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Property Information & Amenities */}
          <div className="w-full lg:w-[900px]">
            <div className="bg-white rounded-lg">
              <h2 className="text-xl font-bold mb-6">Property Information</h2>
              
              <div className="space-y-6 md:space-y-0 grid grid-cols-1 md:grid-cols-2">
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
                </div>
              </div>

              {/* Amenities Section */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-6">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      <Image
                        src="/images/baby-bib-icon.svg"
                        alt="Kids eat free"
                        width={25}
                        height={25}
                      />
                    </div>
                    <span className="text-gray-800">Kids eat free</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      <Image
                        src="/images/breakfast-set-svgrepo-com.svg"
                        alt="Free breakfast"
                        width={25}
                        height={25}
                      />
                    </div>
                    <span className="text-gray-800">Free breakfast</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      <Image
                        src="/images/cleaning-spray-svgrepo-com.svg"
                        alt="Daily housekeeping"
                        width={25}
                        height={25}
                      />
                    </div>
                    <span className="text-gray-800">Daily housekeeping</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      <Image
                        src="/images/weightlifting-gym-svgrepo-com.svg"
                        alt="Fitness center"
                        width={25}
                        height={25}
                      />
                    </div>
                    <span className="text-gray-800">Fitness center</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      <Image
                        src="/images/parking-svgrepo-com.svg"
                        alt="On-site parking"
                        width={25}
                        height={25}
                      />
                    </div>
                    <span className="text-gray-800">On-site parking</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      <Image
                        src="/images/swim-svgrepo-com.svg"
                        alt="Pool"
                        width={25}
                        height={25}
                      />
                    </div>
                    <span className="text-gray-800">Pool</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      <Image
                        src="/images/no-smoking-svgrepo-com.svg"
                        alt="Smoke-free hotel"
                        width={25}
                        height={25}
                      />
                    </div>
                    <span className="text-gray-800">Smoke-free hotel</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                    </div>
                    <span className="text-gray-800">Wi-Fi</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      <Image
                        src="/images/shuttle-svgrepo-com.svg"
                        alt="Area shuttle"
                        width={25}
                        height={25}
                      />
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
        </div>

        {/* Booking Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            href={`/register?redirect=/reserve/${id}`}
            className="bg-[#1a2b3b] text-white py-3 px-8 rounded font-medium hover:bg-[#2c3e50] transition-colors inline-block"
          >
            BOOK ROOM
          </Link>
        </div>
      </main>

      
    </div>
  );
}
