import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import roomsData from '../data/rooms.json';

export default function ReservationConfirmation() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (id) {
      const selectedRoom = roomsData.rooms.find(r => r.id === parseInt(id));
      if (selectedRoom) {
        setRoom(selectedRoom);
      }
    }
  }, [id]);

  if (!room) {
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
        <title>Reservation Confirmed - Best Garden Hotel</title>
        <meta name="description" content="Your reservation has been confirmed" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Reservation Confirmed!</h1>
              <p className="text-gray-600 mt-2">
                Thank you for choosing Best Garden Hotel
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Room Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Type</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per Night</span>
                  <span className="font-medium">${room.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum Occupancy</span>
                  <span className="font-medium">{room.capacity} {room.capacity === 1 ? 'Adult' : 'Adults'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your room will be held for 1 hour</li>
                        <li>Check-in time is 04:00 PM</li>
                        <li>Check-out time is 11:00 AM</li>
                        <li>Please have a valid ID and credit card at check-in</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/search"
                  className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Return to Search
                </Link>
                <button
                  onClick={() => window.print()}
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#1a2b3b] hover:bg-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Print Confirmation
                </button>
              </div>
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
