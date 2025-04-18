import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { useNotification } from '../contexts/NotificationContext';

export default function CheckReservation() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [reservationId, setReservationId] = useState('');
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCheckReservation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reservations/${reservationId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reservation');
      }

      // Handle missing room data gracefully
      if (!data.room) {
        data.room = {
          type: 'Unknown Room Type',
          price: 0,
          images: []
        };
      }

      // Ensure images is always an array
      if (!data.room.images || !Array.isArray(data.room.images)) {
        data.room.images = [];
      }

      setReservation(data);
      addNotification('Reservation found successfully!', 'success');
    } catch (err) {
      setError(err.message);
      addNotification(err.message || 'Reservation not found. Please check your ID and try again.', 'error');
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      addNotification('Please provide a reason for cancellation', 'warning');
      return;
    }

    setCancelLoading(true);
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel reservation');
      }

      addNotification('Reservation cancelled successfully', 'success');
      setShowCancelModal(false);
      setReservation(null);
      setReservationId('');
    } catch (err) {
      addNotification('Failed to cancel reservation. Please try again.', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleBook = () => {
    if (!reservation) {
      addNotification('No reservation found', 'error');
      return;
    }

    // Navigate to payment page with reservation details
    router.push({
      pathname: `/payment/${reservationId}`,
      query: {
        checkIn: new Date(reservation.checkInDate).toISOString(),
        checkOut: new Date(reservation.checkOutDate).toISOString(),
        guests: reservation.numberOfGuests,
        roomType: reservation.room.type,
        totalPrice: reservation.totalPrice
      }
    });
  };

  const handleImageNavigation = (direction) => {
    if (!reservation?.room?.images) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === reservation?.room?.images?.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? reservation?.room?.images?.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Check Reservation - Best Garden Hotel</title>
        <meta name="description" content="Check your reservation status" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Check Reservation</h1>

          {!reservation ? (
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <form onSubmit={handleCheckReservation} className="space-y-4">
                <div>
                  <label htmlFor="reservationId" className="block text-sm font-medium text-gray-700 mb-2">
                    Reservation ID
                  </label>
                  <input
                    type="text"
                    id="reservationId"
                    value={reservationId}
                    onChange={(e) => setReservationId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter your reservation ID"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a2b3b] text-white py-3 px-8 rounded-md font-medium hover:bg-[#2c3e50] transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Checking...' : 'Check Reservation'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Left Column - Room Images */}
                <div className="lg:w-1/2">
                  {reservation?.room?.images && reservation.room.images.length > 0 ? (
                    <div className="relative h-[400px] w-full">
                      <Image
                        src={reservation.room.images[currentImageIndex]}
                        alt={reservation.room.type}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                      />
                      
                      {reservation.room.images.length > 1 && (
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

                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                            {currentImageIndex + 1} / {reservation.room.images.length}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-[400px] w-full bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-500">No images available</p>
                    </div>
                  )}

                  {/* Thumbnail Strip */}
                  {reservation?.room?.images && reservation.room.images.length > 1 && (
                    <div className="flex gap-2 p-4 bg-gray-100 overflow-x-auto">
                      {reservation.room.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                            currentImageIndex === index ? 'ring-2 ring-amber-500' : ''
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${reservation.room.type} view ${index + 1}`}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Room Description */}
                  <div className="p-4">
                    <p className="text-gray-700">{reservation.room.description || 'No description available'}</p>
                  </div>

                  {/* Amenities */}
                  {reservation.room.amenities && (
                    <div className="p-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Room Amenities</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {reservation.room.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Reservation Details */}
                <div className="lg:w-1/2 p-8">
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{reservation.room.type}</h2>
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Capacity:</span> {reservation.numberOfGuests} {reservation.numberOfGuests === 1 ? 'Adult' : 'Adults'}
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-amber-600">${reservation.totalPrice}</span>
                    </div>
                    <p className="text-gray-500 mt-2">Reservation ID: {reservation.id}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Guest Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="text-gray-900">{reservation.user?.firstName} {reservation.user?.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-900">{reservation.user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-gray-900">{reservation.user?.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Reservation Timeline</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Check-in</p>
                          <p className="text-gray-900">{new Date(reservation.checkInDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Check-out</p>
                          <p className="text-gray-900">{new Date(reservation.checkOutDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Status</p>
                          <p className={`font-medium ${
                            reservation.status === 'CONFIRMED' ? 'text-green-600' :
                            reservation.status === 'CANCELLED' ? 'text-red-600' :
                            'text-amber-600'
                          }`}>
                            {reservation.status}
                          </p>
                        </div>
                      </div>
                    </div>

                    {reservation.specialRequests && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Special Requests</h3>
                        <p className="text-gray-600">{reservation.specialRequests}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      {reservation.status === 'PENDING' && (
                        <button
                          onClick={handleBook}
                          className="flex-1 bg-[#1a2b3b] text-white py-4 px-8 rounded-md font-medium hover:bg-[#2c3e50] transition-colors flex items-center justify-center"
                        >
                          <span>BOOK NOW</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      )}
                      {reservation.status === 'CONFIRMED' && (
                        <button
                          onClick={handleCancelClick}
                          className="flex-1 bg-red-600 text-white py-4 px-8 rounded-md font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                        >
                          <span>CANCEL RESERVATION</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Reservation</h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your reservation?
              </p>
              <p className="text-gray-600 mb-4">
               The room will be released immediately and cannot be reclaimed.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                <h4 className="font-medium text-amber-800 mb-2">Reservation Details</h4>
                <p className="text-amber-700">Room: {reservation?.room?.type}</p>
                <p className="text-amber-700">ID: {reservation?.id}</p>
              </div>

              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                Please tell us why you're cancelling *
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows="4"
                placeholder="Enter your reason for cancellation"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelLoading || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {cancelLoading ? 'Canceling...' : 'Confirm Cancelation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 