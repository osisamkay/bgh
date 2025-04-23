import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
    CardElement,
    Elements,
    useStripe,
    useElements,
    PaymentElement,
} from '@stripe/react-stripe-js';

// Initialize Stripe with proper error handling and logging
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : Promise.reject(new Error('Stripe publishable key is missing'));

const PaymentForm = ({ bookingDetails, reservationId }) => {
    const router = useRouter();
    const { addNotification } = useNotification();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [formData, setFormData] = useState({
        cardType: '',
        cardNumber: '',
        cardholderName: '',
        expirationDate: '',
        cvv: '',
        agreeToCancellation: false,
        agreeToTerms: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setPaymentError(null);

        if (!formData.agreeToCancellation || !formData.agreeToTerms) {
            setPaymentError('Please agree to the terms and conditions');
            setIsProcessing(false);
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/reservations/${reservationId}/confirm-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'confirmed',
                    paymentAmount: bookingDetails?.pricing?.total || 0,
                    paymentDetails: {
                        cardType: formData.cardType,
                        cardNumber: formData.cardNumber,
                        cardholderName: formData.cardholderName,
                        expirationDate: formData.expirationDate,
                        cvv: formData.cvv
                    }
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to confirm payment');
            }

            addNotification('Booking confirmed successfully! Redirecting to confirmation page...', 'success');
            router.push(`/booking-confirmation/${reservationId}`);
        } catch (error) {
            console.error('Payment submission error:', error);
            setPaymentError(error.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1">Select Card Type:</label>
                        <select
                            name="cardType"
                            value={formData.cardType}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
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
                            required
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
                            required
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
                                required
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
                                required
                            />
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
                            required
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
                            required
                        />
                        I agree to the terms and conditions of this booking
                    </label>
                </div>
            </div>

            {paymentError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {paymentError}
                </div>
            )}

            <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 px-4 text-white rounded-md ${isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#1B2C42] hover:bg-opacity-90'
                    }`}
            >
                {isProcessing ? 'Processing...' : `Pay $${bookingDetails?.pricing?.total?.toFixed(2) || '0.00'}`}
            </button>
        </form>
    );
};

const Payment = () => {
    const router = useRouter();
    const { id, checkIn, checkOut, guests } = router.query;
    const { user, isLoading: authLoading } = useAuth();
    const { addNotification } = useNotification();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [verificationEmailSent, setVerificationEmailSent] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
        streetAddress: '',
        province: '',
        postalCode: '',
        country: '',
        phone: ''
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
        specialRequest: '',
        agreeToTerms: false,
        agreeToCancellation: false
    });

    const [bookingDetails, setBookingDetails] = useState(null);
    const [currentImage, setCurrentImage] = useState('');
    const [bookingImages, setBookingImages] = useState([]);

    // Generate token when user is logged in
    useEffect(() => {
        const generateToken = async () => {
            if (user && !localStorage.getItem('access_token')) {
                try {
                    const response = await fetch('/api/auth/refresh-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            refreshToken: localStorage.getItem('refresh_token')
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to get token');
                    }

                    const data = await response.json();
                    if (data.token) {
                        localStorage.setItem('access_token', data.token);
                    }
                } catch (error) {
                    console.error('Error generating token:', error);
                    const redirectUrl = `/payment/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
                    localStorage.setItem('redirectAfterLogin', redirectUrl);
                    router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
                }
            }
        };

        generateToken();
    }, [user, id, checkIn, checkOut, guests, router]);

    // Check authentication status
    useEffect(() => {
        if (authLoading) {
            return;
        }

        const hasAuth = user || localStorage.getItem('access_token');

        if (!hasAuth) {
            const redirectUrl = `/payment/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
            localStorage.setItem('redirectAfterLogin', redirectUrl);
            addNotification('Please log in to continue with payment', 'error');
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
    }, [user, authLoading, router, id, checkIn, checkOut, guests, addNotification]);

    // Fetch reservation details
    useEffect(() => {
        async function fetchReservationDetails() {
            if (!id || !user) {
                return;
            }

            try {
                setIsLoading(true);
                const token = localStorage.getItem('access_token');

                if (!token) {
                    throw new Error('Please log in to continue with payment');
                }

                const response = await fetch(`/api/reservations/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch reservation details');
                }

                const data = await response.json();

                if (data.userId !== user.id) {
                    throw new Error('This reservation does not belong to you');
                }

                // Parse images array
                let images = [];
                try {
                    if (typeof data.room.images === 'string') {
                        images = JSON.parse(data.room.images);
                    } else if (Array.isArray(data.room.images)) {
                        images = data.room.images;
                    }
                } catch (e) {
                    console.error('Error parsing images:', e);
                    images = [];
                }

                // Ensure all images are valid URLs
                images = images.filter(img => {
                    try {
                        new URL(img);
                        return true;
                    } catch {
                        return false;
                    }
                });

                if (images.length === 0) {
                    images = ['/images/rooms/placeholder.jpg'];
                }

                // Format dates
                const checkInDate = new Date(data.checkInDate);
                const checkOutDate = new Date(data.checkOutDate);

                // Calculate pricing
                const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
                const basePrice = data.room.price * nights;
                const taxes = basePrice * 0.13;
                const serviceCharge = basePrice * 0.02;
                const seniorDiscount = user?.age >= 65 ? basePrice * 0.05 : 0;
                const total = basePrice + taxes + serviceCharge - seniorDiscount;

                setBookingDetails({
                    checkIn: {
                        date: checkInDate.toLocaleDateString('en-US', { weekday: 'long' }),
                        day: checkInDate.getDate().toString().padStart(2, '0'),
                        month: checkInDate.toLocaleString('en-US', { month: 'long' }).toUpperCase(),
                        year: checkInDate.getFullYear().toString(),
                        time: '4:00 PM'
                    },
                    checkOut: {
                        date: checkOutDate.toLocaleDateString('en-US', { weekday: 'long' }),
                        day: checkOutDate.getDate().toString().padStart(2, '0'),
                        month: checkOutDate.toLocaleString('en-US', { month: 'long' }).toUpperCase(),
                        year: checkOutDate.getFullYear().toString(),
                        time: '11:00 AM'
                    },
                    room: {
                        type: data.room.type.toUpperCase(),
                        guests: `${data.numberOfGuests} ${data.numberOfGuests > 1 ? 'ADULTS' : 'ADULT'}`,
                        amenities: Array.isArray(data.room?.amenities) ? data.room.amenities : [],
                        images: images
                    },
                    pricing: {
                        basePrice: parseFloat(basePrice.toFixed(2)),
                        seniorDiscount: parseFloat(seniorDiscount.toFixed(2)),
                        taxes: parseFloat(taxes.toFixed(2)),
                        serviceCharge: parseFloat(serviceCharge.toFixed(2)),
                        total: parseFloat(total.toFixed(2))
                    }
                });

                setCurrentImage(images[0]);
                setBookingImages(images);
            } catch (error) {
                console.error('Error fetching reservation details:', error);
                addNotification(error.message || 'Failed to load reservation details', 'error');
            } finally {
                setIsLoading(false);
            }
        }

        if (id && user) {
            fetchReservationDetails();
        }
    }, [id, user, addNotification]);

    useEffect(() => {
        if (user) {
            setCustomerInfo(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                confirmEmail: user.email || '',
                streetAddress: user?.address?.street || user?.streetAddress || '',
                province: user?.address?.province || user?.province || '',
                postalCode: user?.address?.postalCode || user?.postalCode || '',
                country: user?.address?.country || user?.country || 'Canada',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (user && !user.emailVerified) {
            setIsVerifyingEmail(true);
        }
    }, [user]);

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
        const currentIndex = bookingImages.indexOf(currentImage);
        const newIndex = currentIndex === 0 ? bookingImages.length - 1 : currentIndex - 1;
        setCurrentImage(bookingImages[newIndex]);
    };

    const handleNextImage = () => {
        const currentIndex = bookingImages.indexOf(currentImage);
        const newIndex = currentIndex === bookingImages.length - 1 ? 0 : currentIndex + 1;
        setCurrentImage(bookingImages[newIndex]);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleResendVerification = async () => {
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send verification email');
            }

            setVerificationEmailSent(true);
            addNotification('Verification email sent. Please check your inbox.', 'success');
        } catch (error) {
            console.error('Error sending verification email:', error);
            addNotification('Failed to send verification email. Please try again.', 'error');
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            addNotification('You can now edit your information', 'info');
        }
    };

    if (isVerifyingEmail) {
        return (
            <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="bg-yellow-100 rounded-full p-3 inline-block mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Email Verification Required</h2>
                        <p className="text-gray-600 mb-6">
                            Please verify your email address before proceeding with payment.
                            {!verificationEmailSent && " If you haven't received the verification email, you can request a new one."}
                        </p>

                        {verificationEmailSent ? (
                            <div className="text-green-600 mb-6">
                                <p>Verification email sent! Please check your inbox.</p>
                                <p className="text-sm mt-2">
                                    After verifying your email, please refresh this page.
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={handleResendVerification}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                Resend Verification Email
                            </button>
                        )}

                        <div className="mt-6 pt-6 border-t">
                            <button
                                onClick={() => router.back()}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                &larr; Return to Previous Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F4F0]">
            <Head>
                <title>Payment - Best Garden Hotel</title>
                <meta name="description" content="Complete your booking payment" />
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

                            <div className="mb-8">
                                <PaymentForm
                                    bookingDetails={bookingDetails}
                                    reservationId={id}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-3 w-full bg-[#1B2C42] text-white rounded hover:bg-opacity-90"
                            >
                                RETURN TO PREVIOUS PAGE
                            </button>
                        </div>
                        <p className="text-center mt-4 text-sm text-gray-600">
                            Clicking 'Make Payment' more than once may result in multiple bookings being made.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="relative h-64 mb-4">
                            {currentImage && (
                                <Image
                                    src={currentImage}
                                    alt={`${bookingDetails?.room?.type || 'Room'}`}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded"
                                    priority
                                />
                            )}
                            {bookingImages.length > 1 && (
                                <>
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
                                </>
                            )}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {bookingImages.map((image, index) => (
                                    <button
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-colors ${image === currentImage ? 'bg-white' : 'bg-gray-400 hover:bg-gray-300'
                                            }`}
                                        onClick={() => setCurrentImage(image)}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">{bookingDetails?.room?.type}</h2>
                            <p className="text-gray-600 mb-4">{bookingDetails?.room?.guests}</p>
                            <h3 className="font-semibold mb-2">Amenities</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {bookingDetails?.room?.amenities?.map((amenity, index) => (
                                    <p key={index} className="text-sm text-gray-600">{amenity}</p>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">CHECK-IN</p>
                                    <p className="font-bold">{bookingDetails?.checkIn?.time}</p>
                                    <p className="text-lg">{bookingDetails?.checkIn?.date}</p>
                                    <p className="text-3xl font-bold">{bookingDetails?.checkIn?.day}</p>
                                    <p className="text-sm">{bookingDetails?.checkIn?.month} {bookingDetails?.checkIn?.year}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">CHECK-OUT</p>
                                    <p className="font-bold">{bookingDetails?.checkOut?.time}</p>
                                    <p className="text-lg">{bookingDetails?.checkOut?.date}</p>
                                    <p className="text-3xl font-bold">{bookingDetails?.checkOut?.day}</p>
                                    <p className="text-sm">{bookingDetails?.checkOut?.month} {bookingDetails?.checkOut?.year}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t mt-6 pt-4">
                            <h3 className="font-bold mb-4">PRICE SUMMARY</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <p>1 x Deluxe King Suite (9 nights)</p>
                                    <p>${bookingDetails?.pricing?.basePrice?.toFixed(2)}</p>
                                </div>
                                {bookingDetails?.pricing?.seniorDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <p>5% Senior Discount</p>
                                        <p>-${bookingDetails?.pricing?.seniorDiscount?.toFixed(2)}</p>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <p>Taxes and Fees (GST/HST 13%)</p>
                                    <p>${bookingDetails?.pricing?.taxes?.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Service Charge (2%)</p>
                                    <p>${bookingDetails?.pricing?.serviceCharge?.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between font-bold pt-2 border-t">
                                    <p>Subtotal</p>
                                    <p>${(bookingDetails?.pricing?.total - bookingDetails?.pricing?.serviceCharge).toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <p>Total</p>
                                    <p>${bookingDetails?.pricing?.total?.toFixed(2)}</p>
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