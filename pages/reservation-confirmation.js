import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import { useNotification } from '../contexts/NotificationContext';

export default function ReservationConfirmation() {
  const router = useRouter();
  const { id } = router.query;
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (id) {
      fetchReservation();
    }
  }, [id]);

  const fetchReservation = async () => {
    try {
      const response = await fetch(`/api/reservations/${id}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.status === 'cancelled') {
          setError('cancelled');
        } else {
          throw new Error(data.message || 'Failed to load reservation');
        }
        return;
      }

      setReservation(data);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      setError('not_found');
      addNotification('Failed to load reservation details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel reservation');
      }

      addNotification('Reservation cancelled successfully', 'success');
      router.push('/');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      addNotification('Failed to cancel reservation', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Reservation Cancelled</h1>
            <p className="text-gray-600 mb-6">This reservation has been cancelled and is no longer available.</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'not_found' || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Reservation Not Found</h1>
            <p className="text-gray-600 mb-6">The reservation you are looking for could not be found.</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Reservation Confirmation - Best Garden Hotel</title>
        <meta name="description" content="Your reservation confirmation at Best Garden Hotel" />
      </Head>

      

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Reservation Confirmation</h1>
            <div className="flex space-x-4">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Print Confirmation
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Cancel Reservation
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Reservation Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Reservation ID</p>
                  <p className="font-medium">{reservation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{reservation.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room Type</p>
                  <p className="font-medium">{reservation.roomType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price per Night</p>
                  <p className="font-medium">${reservation.price}</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Guest Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{reservation.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{reservation.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">{reservation.phoneNumber}</p>
                </div>
              </div>
            </div>

            {reservation.specialRequests && (
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Special Requests</h2>
                <p className="text-gray-700">{reservation.specialRequests}</p>
              </div>
            )}

            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Important Information</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>This reservation will be held for 24 hours</li>
                <li>Please arrive at the hotel reception to complete your check-in</li>
                <li>Have your ID and payment method ready</li>
                <li>Check-in time is from 2:00 PM</li>
                <li>Check-out time is before 12:00 PM</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-[#1a2b3b] text-white rounded-md hover:bg-[#2c3e50] transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      
    </div>
  );
}
