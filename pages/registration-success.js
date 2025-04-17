import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const RegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <Head>
        <title>Registration Successful - Best Garden Hotel</title>
        <meta name="description" content="Your registration at BGH has been successful" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <FaCheckCircle className="text-green-500 text-6xl" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Registration Successful!</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <FaEnvelope className="text-4xl text-[#C6A961] mr-4" />
              <p className="text-lg">
                Please check your email to verify your account
              </p>
            </div>
            
            <div className="text-left space-y-4">
              <h2 className="text-xl font-semibold">Next Steps:</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Open the verification email we sent you</li>
                <li>Click the verification link in the email</li>
                <li>Once verified, you can log in to your account</li>
              </ol>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> The verification link will expire in 24 hours. If you don't see the email, please check your spam folder.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@bgh.com" className="text-[#C6A961] hover:underline">
                support@bgh.com
              </a>
            </p>
            
            <div className="space-x-4">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#1A2A2F] text-white rounded hover:bg-[#2C3F46] transition-colors"
              >
                Return to Home
              </Link>
              <Link
                href="/login"
                className="inline-block px-6 py-3 border border-[#1A2A2F] text-[#1A2A2F] rounded hover:bg-[#1A2A2F] hover:text-white transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </main>

   
    </div>
  );
};

export default RegistrationSuccess; 