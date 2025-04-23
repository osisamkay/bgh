import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import EmailPreview from '../components/notifications/EmailPreview';

const Register = () => {
  const router = useRouter();
  const { signup } = useAuth();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    streetAddress: '',
    cityTown: '',
    postalCode: '',
    provinceState: '',
    country: '',
    termsAccepted: false,
    isAdmin: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [returnUrl, setReturnUrl] = useState(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchGuestData = async () => {
      const { prefilledData, returnUrl } = router.query;

      setReturnUrl(returnUrl)
      if (prefilledData) {
        try {
          setIsLoading(true);
          const decodedData = JSON.parse(decodeURIComponent(prefilledData));

          if (decodedData.reservationId) {
            // Fetch guest information from the reservation
            const response = await fetch(`/api/reservations/${decodedData.reservationId}`);
            const data = await response.json();

            if (response.ok && data.user) {
              // Prefill form with guest information
              setFormData(prev => ({
                ...prev,
                firstName: data.user.firstName || '',
                lastName: data.user.lastName || '',
                email: data.user.email || '',
                confirmEmail: data.user.email || '',
                streetAddress: data.user.streetAddress || '',
                cityTown: data.user.city || '',
                postalCode: data.user.postalCode || '',
                provinceState: data.user.province || '',
                country: data.user.country || '',
                isAdmin: data.user.isAdmin || false
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching guest data:', error);
          addNotification('Could not load guest information. Please fill the form manually.', 'warning');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGuestData();
  }, [router.query, addNotification]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.confirmEmail) newErrors.confirmEmail = 'Please confirm your email';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.streetAddress) newErrors.streetAddress = 'Street address is required';
    if (!formData.cityTown) newErrors.cityTown = 'City/Town is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
    if (!formData.provinceState) newErrors.provinceState = 'Province/State is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';

    // Email match
    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Email addresses do not match';
    }

    // Password validation
    if (formData.password) {
      if (formData.password.length < 8 ||
        !/[A-Z]/.test(formData.password) ||
        !/[a-z]/.test(formData.password) ||
        !/[0-9]/.test(formData.password) ||
        !/[!@#$%^&*]/.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters with one uppercase letter, one lowercase letter, one number, and one special character';
      }
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user exists with this email
      const checkUserResponse = await fetch(`/api/users/check?email=${encodeURIComponent(formData.email)}`);
      const checkUserData = await checkUserResponse.json();

      if (checkUserResponse.ok && checkUserData.exists && checkUserData.role === 'GUEST') {
        // Get reservation ID from prefilled data
        const { prefilledData } = router.query;
        const decodedData = prefilledData ? JSON.parse(decodeURIComponent(prefilledData)) : {};
        const reservationId = decodedData.reservationId;

        // Update existing guest user
        const updateResponse = await fetch(`/api/users/${checkUserData.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            streetAddress: formData.streetAddress,
            city: formData.cityTown,
            postalCode: formData.postalCode,
            province: formData.provinceState,
            country: formData.country,
            termsAccepted: formData.termsAccepted,
            reservationId
          }),
        });

        const updateData = await updateResponse.json();

        if (updateResponse.ok) {
          addNotification('Your account has been updated successfully!', 'success');

          // Handle redirects
          if (updateData.redirectUrl) {
            // Redirect to payment page with reservation details
            router.push(updateData.redirectUrl);
          } else if (returnUrl) {
            // Redirect to the specified return URL
            router.push(decodeURIComponent(returnUrl));
          } else {
            // Default to login page
            router.push('/login');
          }
        } else {
          setErrors({ submit: updateData.message || 'Failed to update account' });
          addNotification(updateData.message || 'Failed to update account', 'error');
        }
      } else {
        // Create new user
        const result = await signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          streetAddress: formData.streetAddress,
          city: formData.cityTown,
          postalCode: formData.postalCode,
          province: formData.provinceState,
          country: formData.country,
          termsAccepted: formData.termsAccepted,
          isAdmin: formData.isAdmin
        });

        if (result.success) {
          const emailPreviewUrl = result.data.emailDetails?.previewUrl;
          const redirectPath = result.isAdmin ? '/admin/dashboard' : '/login';

          // Update email preview URL if available
          if (emailPreviewUrl) {
            setEmailPreviewUrl(emailPreviewUrl);
            // Wait for user to see email preview before redirect
            setTimeout(() => router.push(redirectPath), 5000000000);
          } else {
            router.push(redirectPath);
          }

          addNotification('Registration successful! Please check your email to verify your account.', 'success');
        } else {
          setErrors({ submit: result.message });
          addNotification(result.message, 'error');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'An error occurred during registration. Please try again.' });
      addNotification('An error occurred during registration. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <Head>
        <title>Join BGH™ Member - Best Garden Hotel</title>
        <meta name="description" content="Create your BGH membership account" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto">
          <h1 className="text-2xl font-bold mb-6">Join BGH™ Member</h1>
          <p className="mb-4">*Indicates Required Field</p>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading your information...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Email Address *</label>
                  <input
                    type="email"
                    name="confirmEmail"
                    value={formData.confirmEmail}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.confirmEmail && <p className="text-red-600 text-sm mt-1">{errors.confirmEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Create Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs mt-1">Create a password with at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.</p>
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.streetAddress && <p className="text-red-600 text-sm mt-1">{errors.streetAddress}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">City / Town *</label>
                  <input
                    type="text"
                    name="cityTown"
                    value={formData.cityTown}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.cityTown && <p className="text-red-600 text-sm mt-1">{errors.cityTown}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.postalCode && <p className="text-red-600 text-sm mt-1">{errors.postalCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Province / State *</label>
                  <input
                    type="text"
                    name="provinceState"
                    value={formData.provinceState}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.provinceState && <p className="text-red-600 text-sm mt-1">{errors.provinceState}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#E5E5E5]"
                    disabled={isSubmitting}
                  />
                  {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <label className="text-sm">
                  I certify that I am at least 18 years old and of lawful age, and I have read and accept the{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    terms and conditions
                  </Link>
                  .
                </label>
              </div>
              {errors.termsAccepted && <p className="text-red-600 text-sm mt-1">{errors.termsAccepted}</p>}

              {errors.submit && <p className="text-red-600 text-sm mt-4">{errors.submit}</p>}

              <button
                type="submit"
                className="w-full bg-[#1A2A2F] text-white py-3 px-4 rounded hover:bg-[#2C3F46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'SUBMIT'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Add EmailPreview component */}
      {emailPreviewUrl && (
        <EmailPreview
          previewUrl={emailPreviewUrl}
          onClose={() => setEmailPreviewUrl(null)}
        />
      )}
    </div>
  );
};

export default Register; 