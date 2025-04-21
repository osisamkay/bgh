import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNotification } from '../../contexts/NotificationContext';

const ReservationForm = ({ room, onReservationComplete }) => {
  const router = useRouter();
  const { addNotification } = useNotification();

  // Date formatting functions
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return '';
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle different date formats
      let date;
      if (dateString.includes('/')) {
        // Handle MM/DD/YYYY format
        const [month, day, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      } else if (dateString.includes('-')) {
        // Handle YYYY-MM-DD format
        date = new Date(dateString);
      } else {
        // Try parsing as a timestamp
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return '';

      // Format as YYYY-MM-DD for input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: '',
    termsAccepted: false
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form data from URL parameters
  useEffect(() => {
    const { checkIn, checkOut, guests } = router.query;

    setFormData(prev => ({
      ...prev,
      checkInDate: checkIn ? formatDateForInput(checkIn) : prev.checkInDate,
      checkOutDate: checkOut ? formatDateForInput(checkOut) : prev.checkOutDate,
      numberOfGuests: guests ? parseInt(guests) : prev.numberOfGuests
    }));
  }, [router.query]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.fullName) errors.push('Full Name');
    if (!formData.email) errors.push('Email');
    if (!formData.phone) errors.push('Phone Number');
    if (!formData.termsAccepted) errors.push('Terms and Conditions');

    if (errors.length > 0) {
      addNotification(`Please fill in: ${errors.join(', ')}`, 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      addNotification('Please enter a valid email address', 'error');
      return false;
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      addNotification('Please enter a valid phone number with at least 10 digits', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialRequests: formData.specialRequests,
          id: String(room.id),
          termsAccepted: formData.termsAccepted,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numberOfGuests: formData.numberOfGuests
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addNotification(data.details || data.error || 'Reservation failed', 'error');
        return;
      }

      addNotification(data.details || 'Reservation created successfully!', 'success');
      // Extract preview URL from emailDetails
      const previewUrl = data.emailDetails?.previewUrl;
      console.log('Email preview URL:', previewUrl); // Debug log
      onReservationComplete(data.reservation, previewUrl);
    } catch (error) {
      addNotification('An error occurred while creating your reservation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {step === 1 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Reservation Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    // Remove any non-digit characters except +, -, and space
                    const value = e.target.value.replace(/[^\d+\s-]/g, '');
                    // Ensure at least 10 digits
                    const digits = value.replace(/[^\d]/g, '');
                    if (digits.length <= 10) {
                      setFormData(prev => ({ ...prev, phone: value }));
                    }
                  }}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                {/* <p className="text-xs text-gray-500 mt-1">Format: +1 234 567 8900 (at least 10 digits)</p> */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <input
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleChange}
                  min="1"
                  max={room.capacity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                rows="3"
              />
            </div>
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  required
                />
                <span className="ml-2 text-sm text-gray-600">
                  I accept the{' '}
                  <a href="/terms" className="text-amber-600 hover:text-amber-700">
                    terms and conditions
                  </a>
                </span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Complete Reservation'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReservationForm; 