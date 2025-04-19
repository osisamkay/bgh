import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) return;

      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        // Log the user in with the verified credentials
        await login(data.user);
        
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setError(error.message);
      }
    };

    verifyEmail();
  }, [token, router, login]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Verifying your email...</p>
          </div>
        );
      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-gray-600">
              Your email has been successfully verified. Redirecting you to the homepage...
            </p>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <svg
              className="w-16 h-16 mx-auto text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go to Login
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 