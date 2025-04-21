import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import { useNotification } from '../../contexts/NotificationContext';
import ReservationForm from '../../components/reservation/ReservationForm';
import EmailPreview from '../../components/notifications/EmailPreview';
import ReservationSuccess from '../../components/reservation/ReservationSuccess';

export default function ReservationPage() {
  const router = useRouter();
  const { id, checkIn, checkOut, guests } = router.query;
  const [room, setRoom] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    specialRequests: '',
    roomId: id,
    agreeToTerms: false,
    checkInDate: checkIn || '',
    checkOutDate: checkOut || '',
    guests: guests ? parseInt(guests) : 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchRoom = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/rooms/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch room');
          }
          const data = await response.json();
          setRoom(data);
          setIsLoading(false);

          // Update form data with URL parameters
          setFormData(prev => ({
            ...prev,
            checkInDate: checkIn || prev.checkInDate,
            checkOutDate: checkOut || prev.checkOutDate,
            guests: guests ? parseInt(guests) : prev.guests,
            roomId: id
          }));
        } catch (error) {
          console.error('Error fetching room:', error);
          router.push('/search');
        }
      }
    };

    fetchRoom();
  }, [id, checkIn, checkOut, guests]);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Calculate nights
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const [nights, setNights] = useState(1);

  // Update nights when dates change
  useEffect(() => {
    const updatedNights = calculateNights(formData.checkInDate, formData.checkOutDate);
    if (updatedNights > 0) {
      setNights(updatedNights);
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          checkInDate: formatDateForInput(formData.checkInDate),
          checkOutDate: formatDateForInput(formData.checkOutDate),
          guests: parseInt(formData.guests)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create reservation');
      }

      const data = await response.json();
      console.log('Reservation response:', data, 'emailDetails:', data.emailDetails); // Debug log
      setReservation(data.reservation);
      const previewUrl = data.emailDetails?.previewUrl;
      setEmailPreviewUrl(previewUrl);
      addNotification('Reservation created successfully!', 'success');

      // Call onReservationComplete with the correct data
      if (typeof onReservationComplete === 'function') {
        onReservationComplete(data.reservation, previewUrl);
      }
    } catch (error) {
      setError(error.message);
      addNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
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

              {reservation ? (
                <ReservationSuccess
                  reservation={reservation}
                  emailDetails={{ previewUrl: emailPreviewUrl }}
                />
              ) : (
                <ReservationForm
                  room={room}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  error={error}
                  onReservationComplete={(reservationData, previewUrl) => {
                    console.log('Preview URL:', previewUrl);
                    setReservation(reservationData);
                    if (previewUrl) {
                      setEmailPreviewUrl(previewUrl);
                      // Clear email preview after 30 seconds
                      setTimeout(() => setEmailPreviewUrl(null), 30000);
                    }
                    addNotification('Reservation created successfully!', 'success');
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {emailPreviewUrl && (
          <EmailPreview
            previewUrl={emailPreviewUrl}
            onClose={() => setEmailPreviewUrl(null)}
            reservationId={reservation?.id}
          />
        )}
      </main>
    </div>
  );
}
