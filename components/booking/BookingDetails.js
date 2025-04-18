import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import EmailPreview from '../notifications/EmailPreview';

const BookingDetails = ({ roomDetails }) => {
  const router = useRouter();
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const { data: session } = useSession();
  const [bookingInfo, setBookingInfo] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);
  const [discounts, setDiscounts] = useState({
    senior: 0,
    group: 0,
    total: 0
  });

  const calculateDiscounts = () => {
    let seniorDiscount = 0;
    let groupDiscount = 0;

    // Calculate senior discount (5% if age >= 65)
    if (session?.user?.age >= 65) {
      seniorDiscount = roomDetails.price * 0.05;
    }

    // Calculate group discount based on number of guests
    const numGuests = bookingInfo.numberOfGuests;
    if (numGuests >= 20) {
      groupDiscount = roomDetails.price * 0.25;
    } else if (numGuests >= 10) {
      groupDiscount = roomDetails.price * 0.15;
    } else if (numGuests >= 5) {
      groupDiscount = roomDetails.price * 0.05;
    }

    const totalDiscount = seniorDiscount + groupDiscount;
    setDiscounts({
      senior: seniorDiscount,
      group: groupDiscount,
      total: totalDiscount
    });
  };

  useEffect(() => {
    calculateDiscounts();
  }, [bookingInfo.numberOfGuests, session?.user?.age]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingInfo.checkInDate || !bookingInfo.checkOutDate) {
      addNotification('Please provide check-in and check-out dates', 'error');
      return;
    }
    
    // Validate dates
    const checkIn = new Date(bookingInfo.checkInDate);
    const checkOut = new Date(bookingInfo.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      addNotification('Check-in date cannot be in the past', 'error');
      return;
    }
    
    if (checkOut <= checkIn) {
      addNotification('Check-out date must be after check-in date', 'error');
      return;
    }
    
    // Make sure we have user contact information
    if (!user || !user.email) {
      addNotification('Please login or provide contact information to continue', 'error');
      return;
    }

    setIsSubmitting(true);
    setEmailPreviewUrl(null);
    
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          id: roomDetails.id,
          checkInDate: bookingInfo.checkInDate,
          checkOutDate: bookingInfo.checkOutDate,
          numberOfGuests: bookingInfo.numberOfGuests,
          specialRequests: bookingInfo.specialRequests,
          termsAccepted: true,
          fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Guest User',
          email: user ? user.email : '',
          phone: user ? user.phone || '1234567890' : '1234567890'  // Provide default phone if missing
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addNotification(data.message || 'Booking confirmed successfully!', 'success');
        
        // Set email preview URL if available
        if (data.emailPreviewUrl) {
          setEmailPreviewUrl(data.emailPreviewUrl);
        }
        
        // Redirect to reservation confirmation page after a short delay
        setTimeout(() => {
          router.push(`/reservation-confirmation?id=${data.reservation.id}`);
        }, 1000);
      } else {
        addNotification(data.details || data.error || 'Failed to create reservation', 'error');
      }
    } catch (error) {
      console.error('Booking error:', error);
      addNotification('An unexpected error occurred during booking. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = roomDetails.price - discounts.total;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Room Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Room Type</p>
            <p className="font-medium">{roomDetails.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Base Price</p>
            <p className="font-medium">${roomDetails.price}</p>
          </div>
          
          {/* Display Senior Discount if applicable */}
          {discounts.senior > 0 && (
            <div>
              <p className="text-gray-600">Senior Discount (5%)</p>
              <p className="font-medium text-green-600">-${discounts.senior.toFixed(2)}</p>
            </div>
          )}
          
          {/* Display Group Discount if applicable */}
          {discounts.group > 0 && (
            <div>
              <p className="text-gray-600">
                Group Discount ({bookingInfo.numberOfGuests >= 20 ? '25%' : 
                              bookingInfo.numberOfGuests >= 10 ? '15%' : '5%'})
              </p>
              <p className="font-medium text-green-600">-${discounts.group.toFixed(2)}</p>
            </div>
          )}
          
          <div>
            <p className="text-gray-600">Total Price</p>
            <p className="font-medium">${totalPrice.toFixed(2)}</p>
          </div>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Check-in Date</label>
              <input
                type="date"
                name="checkInDate"
                value={bookingInfo.checkInDate}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Check-out Date</label>
              <input
                type="date"
                name="checkOutDate"
                value={bookingInfo.checkOutDate}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Number of Guests</label>
            <input
              type="number"
              name="numberOfGuests"
              value={bookingInfo.numberOfGuests}
              onChange={handleInputChange}
              min="1"
              max={roomDetails.maxOccupancy}
              className="w-full border rounded-md px-3 py-2"
              required
            />
            {bookingInfo.numberOfGuests >= 5 && (
              <p className="text-sm text-green-600 mt-1">
                Group discount applied: {bookingInfo.numberOfGuests >= 20 ? '25%' : 
                                      bookingInfo.numberOfGuests >= 10 ? '15%' : '5%'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Special Requests</label>
            <textarea
              name="specialRequests"
              value={bookingInfo.specialRequests}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2"
              rows="3"
            />
          </div>
        </form>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !bookingInfo.checkInDate || !bookingInfo.checkOutDate}
            className={`w-full bg-amber-500 text-white px-4 py-2 rounded-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-600'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </div>

      {emailPreviewUrl && (
        <EmailPreview
          previewUrl={emailPreviewUrl}
          onClose={() => setEmailPreviewUrl(null)}
        />
      )}
    </div>
  );
};

export default BookingDetails; 