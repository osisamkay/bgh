import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';

export default function ReservationConfirmation() {
  const router = useRouter();
  const { id } = router.query;
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch reservation details when the ID is available
    if (id) {
      fetchReservation(id);
    }
  }, [id]);

  const fetchReservation = async (reservationId) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reservation details');
      }
      
      const data = await response.json();
      setReservation(data);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      setError('Unable to load your reservation details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Reservation Confirmation - Best Garden Hotel</title>
        <meta name="description" content="Your reservation at Best Garden Hotel has been confirmed" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-lg text-gray-600">Loading reservation details...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
              <Link href="/" className="text-blue-600 hover:underline">
                Return to Home
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-gray-800 text-white p-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Reservation Confirmed</h1>
                  <div className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-full">
                    Confirmed
                  </div>
                </div>
                <p className="mt-2 text-gray-300">Thank you for choosing Best Garden Hotel</p>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Reservation Details</h2>
                    <p className="text-gray-600 mt-1">Booking ID: {reservation?.id || 'N/A'}</p>
                    <p className="text-gray-600">Booking Date: {new Date(reservation?.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Link href="/my-reservations" className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors inline-flex items-center">
                      <span>View All Reservations</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-2">Guest Information</h3>
                      <p className="text-gray-700">{reservation?.fullName || 'N/A'}</p>
                      <p className="text-gray-700">{reservation?.email || 'N/A'}</p>
                      <p className="text-gray-700">{reservation?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-2">Stay Information</h3>
                      <p className="text-gray-700">Check-in: {reservation?.checkInDate || 'N/A'}</p>
                      <p className="text-gray-700">Check-out: {reservation?.checkOutDate || 'N/A'}</p>
                      <p className="text-gray-700">{reservation?.rooms || 1} Room(s), {reservation?.guests || 1} Guest(s)</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-4">Room Information</h3>
                  <div className="flex items-start rounded border border-gray-200 p-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-300 rounded"></div>
                    <div className="ml-4 flex-grow">
                      <h4 className="font-medium text-gray-800">{reservation?.roomType || 'Room'}</h4>
                      <p className="text-gray-600 text-sm mt-1">Max Occupancy: {reservation?.guests || 2} Adults</p>
                      <div className="mt-2 flex justify-between items-end">
                        <div>
                          <span className="text-xs text-gray-500">Price per night</span>
                          <p className="font-bold text-gray-800">${reservation?.price || 0}</p>
                        </div>
                        <Link href={`/room/${reservation?.roomId}`} className="text-blue-600 hover:underline text-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold text-gray-800">Booking Summary</h3>
                    <Link href="/invoice" className="text-blue-600 hover:underline text-sm flex items-center">
                      <span>View Invoice</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Charge</span>
                      <span className="text-gray-800">${reservation?.price || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="text-gray-800">${(reservation?.price * 0.15).toFixed(2) || 0}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>${(reservation?.price * 1.15).toFixed(2) || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Need Assistance?</h3>
                  <p className="text-gray-600">
                    If you have any questions or need to make changes to your reservation, please contact us at:
                  </p>
                  <div className="mt-2">
                    <a href="tel:1-888-675-7887" className="text-blue-600 hover:underline">1-888-675-7887</a>
                    <span className="mx-2 text-gray-400">|</span>
                    <a href="mailto:reservations@bgh.com" className="text-blue-600 hover:underline">reservations@bgh.com</a>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Link href="/" className="bg-gray-800 text-white py-3 px-6 rounded hover:bg-gray-700 transition-colors inline-block">
                    Return to Home Page
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-amber-500 text-center py-4 mt-8" style={{ backgroundColor: "#d4b053" }}>
        <p className="text-white">© 2025 BGH. All rights reserved.</p>
      </footer>
    </div>
  );
}
