import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Payment = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    confirmEmail: user?.email || '',
    streetAddress: user?.streetAddress || '',
    province: user?.province || '',
    postalCode: user?.postalCode || '',
    country: user?.country || '',
    phone: user?.phone || ''
  });

  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    province: '',
    postalCode: '',
    country: '',
    phone: ''
  });

  const [formData, setFormData] = useState({
    cardType: '',
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    cvv: '',
    billingAddressSameAsCustomer: true,
    specialRequest: '',
    agreeToTerms: false,
    agreeToCancellation: false
  });

  const [bookingDetails, setBookingDetails] = useState({
    checkIn: {
      date: 'Tuesday',
      day: '08',
      month: 'JULY',
      year: '2025',
      time: '4:00 PM'
    },
    checkOut: {
      date: 'Thursday',
      day: '17',
      month: 'JULY',
      year: '2025',
      time: '11:00 PM'
    },
    room: {
      type: 'DELUXE KING SUITE',
      guests: '2 ADULTS',
      amenities: [
        'Wi-Fi', 'Breakfast', 'Free parking', 'Swimming pool',
        'Non-smoking', 'Microwave', 'Refrigerator', 'In-Room safe'
      ],
      images: ['/room1.jpg', '/room2.jpg', '/room3.jpg', '/room4.jpg']
    },
    pricing: {
      basePrice: 2500.87,
      seniorDiscount: 125.04,
      taxes: 308.85,
      serviceCharge: 47.52,
      total: 2732.20
    }
  });

  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    if (user) {
      setCustomerInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        confirmEmail: user.email || '',
        streetAddress: user.streetAddress || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  useEffect(() => {
    // Fetch booking details when component mounts
    async function fetchBookingDetails() {
      try {
        const response = await fetch(`/api/bookings/${router.query.bookingId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch booking details');
        }

        // Verify booking hasn't been paid already
        if (data.payment && data.payment.status === 'completed') {
          router.push('/booking-confirmation');
          return;
        }

        setBookingDetails(data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        router.push('/error');
      }
    }

    if (router.query.bookingId) {
      fetchBookingDetails();
    }
  }, [router.query.bookingId]);

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBillingInfoChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBillingAddressChange = (e) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      billingAddressSameAsCustomer: checked
    }));
    if (checked) {
      setBillingInfo({
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        streetAddress: customerInfo.streetAddress,
        province: customerInfo.province,
        postalCode: customerInfo.postalCode,
        country: customerInfo.country,
        phone: customerInfo.phone
      });
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? bookingDetails.room.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === bookingDetails.room.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeToCancellation || !formData.agreeToTerms) {
      addNotification('Please agree to all terms and conditions', 'error');
      return;
    }
    // Add payment processing logic here
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      addNotification('You can now edit your information', 'info');
    }
  };

  const handlePaymentComplete = async (paymentResult) => {
    setPaymentStatus('success');
    
    // Redirect to confirmation page after a short delay
    setTimeout(() => {
      router.push(`/booking-confirmation?id=${bookingDetails.id}`);
    }, 2000);
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <Head>
        <title>Payment - Best Garden Hotel</title>
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">BOOKING SUMMARY</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">CUSTOMER INFORMATION</h2>
                <button 
                  onClick={toggleEdit}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {isEditing ? 'Done' : 'Edit'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={customerInfo.firstName}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="First Name"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
                <input
                  type="text"
                  name="lastName"
                  value={customerInfo.lastName}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="Last Name"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="Email Address"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
                <input
                  type="email"
                  name="confirmEmail"
                  value={customerInfo.confirmEmail}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="Confirm Email"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
                <input
                  type="text"
                  name="streetAddress"
                  value={customerInfo.streetAddress}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="Street Address"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
                <input
                  type="text"
                  name="province"
                  value={customerInfo.province}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="Province/State"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
                <input
                  type="text"
                  name="postalCode"
                  value={customerInfo.postalCode}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="Postal Code"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
                <input
                  type="text"
                  name="country"
                  value={customerInfo.country}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="Country"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  disabled={!isEditing}
                  placeholder="Phone Number"
                  className="p-2 border rounded bg-[#E5E5E5]"
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">SPECIAL REQUEST (Optional)</h2>
              <textarea
                name="specialRequest"
                value={formData.specialRequest}
                onChange={handleInputChange}
                className="w-full p-2 border rounded min-h-[100px]"
                placeholder="Type your request"
              />
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">PAYMENT INFORMATION</h2>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="billingAddressSameAsCustomer"
                    checked={formData.billingAddressSameAsCustomer}
                    onChange={handleBillingAddressChange}
                    className="mr-2"
                  />
                  Billing Address is the same as customer information
                </label>
              </div>

              {!formData.billingAddressSameAsCustomer && (
                <div className="mb-6 border-t pt-4">
                  <h3 className="text-md font-semibold mb-4">Billing Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      value={billingInfo.firstName}
                      onChange={handleBillingInfoChange}
                      placeholder="First Name"
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={billingInfo.lastName}
                      onChange={handleBillingInfoChange}
                      placeholder="Last Name"
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="streetAddress"
                      value={billingInfo.streetAddress}
                      onChange={handleBillingInfoChange}
                      placeholder="Street Address"
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="province"
                      value={billingInfo.province}
                      onChange={handleBillingInfoChange}
                      placeholder="Province/State"
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      value={billingInfo.postalCode}
                      onChange={handleBillingInfoChange}
                      placeholder="Postal Code"
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="country"
                      value={billingInfo.country}
                      onChange={handleBillingInfoChange}
                      placeholder="Country"
                      className="p-2 border rounded"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={billingInfo.phone}
                      onChange={handleBillingInfoChange}
                      placeholder="Phone Number"
                      className="p-2 border rounded"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Select Card Type:</label>
                  <select
                    name="cardType"
                    value={formData.cardType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select...</option>
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="amex">American Express</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Credit/Debit Card Number:</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Card number"
                  />
                </div>
                <div>
                  <label className="block mb-1">Cardholder's Name:</label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Name on card"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Expiration Date:</label>
                    <input
                      type="text"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">CVV:</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      placeholder="123"
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="agreeToCancellation"
                  checked={formData.agreeToCancellation}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                I agree to the rate, room and cancellation policies of this booking
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                I agree to the terms and conditions of this booking
              </label>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-[#1B2C42] text-white rounded hover:bg-opacity-90"
              >
                RETURN TO PREVIOUS PAGE
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-[#1B2C42] text-white rounded hover:bg-opacity-90"
              >
                MAKE PAYMENT
              </button>
            </div>
            <p className="text-center mt-4 text-sm text-gray-600">
              Clicking 'Make Payment' more than once may result in multiple bookings being made.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="relative h-64 mb-4">
              <Image
                src={bookingDetails.room.images[currentImageIndex]}
                alt={`${bookingDetails.room.type} - Image ${currentImageIndex + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded"
                priority={currentImageIndex === 0}
                onError={(e) => {
                  e.target.src = '/images/rooms/placeholder.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {bookingDetails.room.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-gray-400 hover:bg-gray-300'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">{bookingDetails.room.type}</h2>
              <p className="text-gray-600 mb-4">{bookingDetails.room.guests}</p>
              <h3 className="font-semibold mb-2">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {bookingDetails.room.amenities.map((amenity, index) => (
                  <p key={index} className="text-sm text-gray-600">{amenity}</p>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">CHECK-IN</p>
                  <p className="font-bold">{bookingDetails.checkIn.time}</p>
                  <p className="text-lg">{bookingDetails.checkIn.date}</p>
                  <p className="text-3xl font-bold">{bookingDetails.checkIn.day}</p>
                  <p className="text-sm">{bookingDetails.checkIn.month} {bookingDetails.checkIn.year}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">CHECK-OUT</p>
                  <p className="font-bold">{bookingDetails.checkOut.time}</p>
                  <p className="text-lg">{bookingDetails.checkOut.date}</p>
                  <p className="text-3xl font-bold">{bookingDetails.checkOut.day}</p>
                  <p className="text-sm">{bookingDetails.checkOut.month} {bookingDetails.checkOut.year}</p>
                </div>
              </div>
            </div>

            <div className="border-t mt-6 pt-4">
              <h3 className="font-bold mb-4">PRICE SUMMARY</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>1 x Deluxe King Suite (9 nights)</p>
                  <p>${bookingDetails.pricing.basePrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-green-600">
                  <p>5% Senior Discount</p>
                  <p>-${bookingDetails.pricing.seniorDiscount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Taxes and Fees (GST/HST 13%)</p>
                  <p>${bookingDetails.pricing.taxes.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Service Charge (2%)</p>
                  <p>${bookingDetails.pricing.serviceCharge.toFixed(2)}</p>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <p>Subtotal</p>
                  <p>${(bookingDetails.pricing.total - bookingDetails.pricing.serviceCharge).toFixed(2)}</p>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>${bookingDetails.pricing.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment; 