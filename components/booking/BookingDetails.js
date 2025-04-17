import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '../../contexts/NotificationContext';

const BookingDetails = ({ roomDetails }) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { data: session } = useSession();
  const [bookingInfo, setBookingInfo] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: '',
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
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

  const handleConfirm = () => {
    setIsConfirmed(true);
    showNotification('Booking confirmed! Proceeding to payment...', 'success');
    // Redirect to payment page after a short delay
    setTimeout(() => {
      router.push('/payment');
    }, 1500);
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
            onClick={handleConfirm}
            disabled={isConfirmed || !bookingInfo.checkInDate || !bookingInfo.checkOutDate}
            className={`w-full bg-amber-500 text-white px-4 py-2 rounded-md ${
              isConfirmed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-600'
            }`}
          >
            {isConfirmed ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails; 