import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { useNotification } from '../contexts/NotificationContext';

export default function ResetPassword() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      addNotification('Password reset instructions have been sent to your email', 'success');
      router.push('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      addNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Reset Password - Best Garden Hotel</title>
        <meta name="description" content="Reset your BGH account password" />
      </Head>

      

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">RESET YOUR PASSWORD</h1>

          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1a2b3b] text-white py-3 px-4 rounded-md hover:bg-[#2c3e50] transition-colors disabled:bg-gray-400"
              >
                {isSubmitting ? 'SENDING...' : 'SEND RESET INSTRUCTIONS'}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-blue-600 hover:underline text-sm">
                  Return to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      
    </div>
  );
} 