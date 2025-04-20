import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      addNotification('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Login - Best Garden Hotel</title>
        <meta name="description" content="Login to your BGH account" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto flex flex-col md:flex-row gap-12">
          {/* Left Column - Login Form */}
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">PLEASE LOG IN.</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="ex: joymotivation@host.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a2b3b] text-white py-3 px-4 rounded-md hover:bg-[#2c3e50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'SIGNING IN...' : 'LOGIN'}
              </button>

              <div className="mt-4">
                <p className="text-sm text-gray-700">Need help with your password?</p>
                <Link href="/reset-password" className="text-red-600 hover:underline text-sm">
                  Reset password
                </Link>
              </div>
            </form>
          </div>

          {/* Right Column - Create Account */}
          <div className="w-full md:w-1/2 md:border-l md:pl-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">NOT A BGH™ MEMBER ?</h2>

            <div className="space-y-4 mb-8">
              <p className="text-gray-700">
                Experience luxury the way it should be: personal, rewarding, and tailored just for you.
              </p>
              <p className="text-gray-700">
                Register today to unlock exclusive discounts and elevate your stay at BGH!
              </p>
            </div>

            <Link href="/learn-more" className="text-blue-600 hover:underline block mb-8">
              Learn more about BGH Offers
            </Link>

            <Link
              href="/register"
              className="inline-block w-full bg-[#1a2b3b] text-white text-center py-3 px-4 rounded-md hover:bg-[#2c3e50] transition-colors"
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>
      </main>


    </div>
  );
}
