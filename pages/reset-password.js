// pages/reset-password.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useNotification } from '../contexts/NotificationContext';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('request'); // 'request' or 'reset'

  useEffect(() => {
    // If token is in URL, show reset form
    if (token) {
      setView('reset');
    } else {
      setView('request');
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        addNotification(data.message, 'success');
        setFormData({ email: '' });
      } else {
        setError(data.message);
        addNotification(data.message, 'error');
      }
    } catch (err) {
      console.error('Request error:', err);
      setError('An error occurred. Please try again.');
      addNotification('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        addNotification(data.message, 'success');
        // Redirect to login page after successful reset
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message);
        addNotification(data.message, 'error');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('An error occurred. Please try again.');
      addNotification('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{view === 'request' ? 'Reset Password Request' : 'Reset Your Password'} - Best Garden Hotel</title>
        <meta name="description" content="Reset your Best Garden Hotel account password" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-8">
          {view === 'request' ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Reset Password</h1>
              <p className="mb-6 text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleRequestSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="youremail@example.com"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a2b3b] text-white py-2 px-4 rounded-md hover:bg-[#2c3e50] transition-colors disabled:opacity-50"
                >
                  {loading ? 'SENDING...' : 'SEND RESET LINK'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Password</h1>
              <p className="mb-6 text-gray-600">
                Please enter a new password for your account.
              </p>

              <form onSubmit={handleResetSubmit}>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter new password"
                    minLength="8"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Confirm new password"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a2b3b] text-white py-2 px-4 rounded-md hover:bg-[#2c3e50] transition-colors disabled:opacity-50"
                >
                  {loading ? 'UPDATING...' : 'RESET PASSWORD'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-amber-600 hover:text-amber-800">
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}