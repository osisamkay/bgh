import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import roomsData from '../../data/rooms.json';
import { useNotification } from '../../context/NotificationContext';

export default function ReservationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    specialRequests: '',
    acceptedTerms: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName.trim()) {
      addNotification('Please enter your full name', 'warning');
      return;
    }
    if (!formData.email.trim()) {
      addNotification('Please enter your email address', 'warning');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      addNotification('Please enter your phone number', 'warning');
      return;
    }
    if (!formData.specialRequests.trim()) {
      addNotification('Please enter special requests', 'warning');
      return;
    }
    if (!formData.acceptedTerms) {
      addNotification('Please accept the terms and conditions', 'warning');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reservationData = {
        ...formData,
        roomId: id,
        roomType: room.type,
        price: room.price,
        reservationDate: new Date().toISOString(),
        status: 'pending'
      };

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create reservation');
      }

      addNotification('Reservation created successfully!', 'success');
      router.push(`/reservation-confirmation?id=${data.id}`);
    } catch (error) {
      setError(error.message || 'Failed to create reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Reserve {room.type} - Best Garden Hotel</title>
        <meta name="description" content={`Reserve your stay at ${room.type}`} />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Room Image and Details */}
          <div className="w-full lg:w-2/3">
            <div className="relative h-[400px] w-full lg:max-w-[700px] rounded-lg overflow-hidden">
              <Image
                src={room.images ? room.images[0] : room.image}
                alt={room.type}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
                priority
              />
            </div>

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
                  <Link href={`/room/${id}`} className="text-blue-600 hover:underline">
                    Change selection
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reservation Form */}
          <div className="w-full lg:w-[900px]">
            <div className="bg-white rounded-lg">
              <h2 className="text-2xl font-bold mb-8">Complete your Reservation</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter any special requests or requirements"
                  ></textarea>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="acceptedTerms"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptedTerms" className="ml-2 text-sm text-gray-600">
                    I have read and accept the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      terms and conditions
                    </Link>
                    .
                  </label>
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1a2b3b] text-white py-4 px-8 rounded font-medium hover:bg-[#2c3e50] transition-colors disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Processing...' : 'RESERVE ROOM'}
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>Note: This room will be held for 1 hour.</p>
                  <p className="mt-1">To confirm your reservation, please proceed to booking and payment.</p>
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
