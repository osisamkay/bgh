import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import RoomImagePlaceholder from '../../components/RoomImagePlaceholder';
import roomsData from '../../data/rooms.json';

export default function ReserveRoom() {
  const router = useRouter();
  const { id } = router.query;
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    termsAccepted: false
  });
  
  // Room data
  const [room, setRoom] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Mock images for the room
  const roomImages = ['/images/rooms/room1.jpg', '/images/rooms/room2.jpg', '/images/rooms/room3.jpg'];

  // Fetch room data when the ID is available
  useEffect(() => {
    if (id) {
      // Find the room by ID
      const selectedRoom = roomsData.rooms.find(r => r.id === parseInt(id));
      setRoom(selectedRoom || null);
    }
  }, [id]);

  // Handle image navigation
  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? roomImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === roomImages.length - 1 ? 0 : prev + 1));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    
    if (!formData.termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare the reservation data
      const reservationData = {
        ...formData,
        roomId: parseInt(id),
        roomType: room.type,
        price: room.price,
        checkInDate: router.query.checkIn || '07/07/2025',
        checkOutDate: router.query.checkOut || '07/17/2025',
        guests: parseInt(router.query.guests) || 2,
        rooms: parseInt(router.query.rooms) || 1
      };
      
      // Send the reservation data to the API
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }
      
      const result = await response.json();
      
      // Show success message
      setSuccess(true);
      
      // Redirect to confirmation page after a delay
      setTimeout(() => {
        router.push({
          pathname: '/reservation-confirmation',
          query: { id: result.id }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error creating reservation:', error);
      setError('Failed to submit reservation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-lg">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Reserve {room.type} - Best Garden Hotel</title>
        <meta name="description" content={`Reserve your stay in our ${room.type}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Room Image and Details */}
          <div className="w-full lg:w-1/2">
            {/* Room Image Slider */}
            <div className="relative h-96 mb-6 bg-gray-100 rounded overflow-hidden">
              <RoomImagePlaceholder type={room.type} className="absolute inset-0" />
              
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
            
            {/* Room Details */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold mr-6">{room.type.toUpperCase()}</h1>
                <div className="text-lg text-gray-600 border-l border-gray-300 pl-6">{room.capacity} ADULTS</div>
              </div>
              
              <p className="mt-4 text-gray-700">
                {room.description}
              </p>
              
              <p className="mt-6 text-2xl font-bold">${room.price} / night</p>
              
              <div className="mt-4">
                <Link href={`/room/${id}`} className="text-blue-600 hover:underline cursor-pointer">
                  Change selection
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Column - Reservation Form */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Complete your Reservation</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  Reservation submitted successfully! Redirecting to confirmation page...
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="specialRequests" className="block text-gray-700 font-medium mb-2">
                    Special Requests (optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-2 text-gray-700">
                      I have read and accept the{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        terms and conditions
                      </Link>.
                    </span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 font-medium">Note: This room will be held for 1 hour.</p>
                  <p className="text-gray-700 mt-2">To confirm your reservation, please proceed to booking and payment.</p>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="bg-gray-800 text-white py-3 px-6 rounded font-medium hover:bg-gray-700 transition-colors w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'RESERVE ROOM'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-amber-500 text-center py-4 mt-8" style={{ backgroundColor: "#d4b053" }}>
        <p className="text-white">© 2025 BGH. All rights reserved.</p>
      </footer>
    </div>
  );
}
