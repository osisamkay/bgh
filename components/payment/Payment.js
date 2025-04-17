import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import CryptoJS from 'crypto-js';

const Payment = ({ reservation, onPaymentComplete }) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [showProcessingMessage, setShowProcessingMessage] = useState(false);
  const paymentAttemptRef = useRef(false);
  const processingTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    streetAddress: user?.streetAddress || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    province: user?.province || '',
    country: user?.country || '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });

  // Prevent page refresh or close during payment
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (paymentInProgress) {
        e.preventDefault();
        e.returnValue = '';
        return 'Payment is in progress. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [paymentInProgress]);

  const encryptCardData = (data) => {
    const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    return {
      cardNumber: CryptoJS.AES.encrypt(data.cardNumber, secretKey).toString(),
      expiryDate: CryptoJS.AES.encrypt(data.expiryDate, secretKey).toString(),
      cvc: CryptoJS.AES.encrypt(data.cvc, secretKey).toString(),
    };
  };

  const validateCardDetails = () => {
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    const expiryDate = formData.expiryDate;
    const cvc = formData.cvc;

    // Basic validation
    if (!/^\d{16}$/.test(cardNumber)) {
      showNotification('Invalid card number', 'error');
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      showNotification('Invalid expiry date format (MM/YY)', 'error');
      return false;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      showNotification('Invalid CVC', 'error');
      return false;
    }

    // Check if card is expired
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      showNotification('Card is expired', 'error');
      return false;
    }

    return true;
  };

  const handleConfirmPayment = async () => {
    if (paymentAttemptRef.current) {
      showNotification('Payment is already in progress', 'error');
      return;
    }

    if (!validateCardDetails()) {
      return;
    }

    try {
      paymentAttemptRef.current = true;
      setPaymentInProgress(true);
      setLoading(true);
      setShowProcessingMessage(true);

      // Encrypt sensitive card data
      const encryptedCardData = encryptCardData({
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvc: formData.cvc,
      });

      const paymentData = {
        reservationId: reservation.id,
        amount: calculateTotal().total,
        paymentMethod,
        ...formData,
        ...encryptedCardData,
      };

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const result = await response.json();

      if (result.status === 'succeeded') {
        showNotification('Payment successful!', 'success');
        onPaymentComplete();
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error) {
      showNotification('Payment failed. Please try again.', 'error');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
      setPaymentInProgress(false);
      setShowProcessingMessage(false);
      paymentAttemptRef.current = false;
    }
  };

  const calculateTotal = () => {
    const subtotal = reservation?.totalPrice || 0;
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const validateForm = () => {
    if (paymentMethod === 'card') {
      if (!formData.cardholderName || !formData.cardNumber || !formData.expiryDate || !formData.cvc) {
        showNotification('Please fill in all card details', 'error');
        return false;
      }
      // Add more validation for card number format, expiry date, etc.
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
      
      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Billing Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Street Address</label>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Province</label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => handlePaymentMethodChange('card')}
            className={`px-4 py-2 rounded-md ${
              paymentMethod === 'card'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Credit/Debit Card
          </button>
          <button
            onClick={() => handlePaymentMethodChange('cash')}
            className={`px-4 py-2 rounded-md ${
              paymentMethod === 'cash'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Pay at Hotel
          </button>
        </div>

        {paymentMethod === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CVC</label>
              <input
                type="text"
                name="cvc"
                value={formData.cvc}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="123"
              />
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Room Price:</span>
            <span>${calculateTotal().subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (5%):</span>
            <span>${calculateTotal().tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${calculateTotal().total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed to Payment Button */}
      <div className="flex justify-end">
        <button
          onClick={handleProceedToPayment}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>

      {/* Payment Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Payment</h3>
            <p className="mb-6">Are you sure you want to proceed with the payment?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue with Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Message */}
      {showProcessingMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Processing Payment</h3>
            <p className="mb-4">Please do not refresh or close this page while we process your payment.</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment; 