import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function VerifyEmail() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timeout
  const [token, setToken] = useState('');
  
  useEffect(() => {
    // Check if there's a token in the URL (for direct verification links)
    const { token: urlToken } = router.query;
    if (urlToken) {
      setToken(urlToken);
    }
  }, [router.query]);

  useEffect(() => {
    // If user is already verified, redirect to home
    if (user && user.emailVerified) {
      addNotification('Your email is already verified', 'info');
      router.push('/');
      return;
    }

    // If user is not logged in at all, redirect to login
    if (!user && !router.query.token) {
      router.push('/login');
      return;
    }

    // Countdown timer for automatic redirection
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, router, addNotification]);

  // Handle verification from URL token
  useEffect(() => {
    const verifyFromToken = async () => {
      if (token) {
        try {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            addNotification('Email verified successfully!', 'success');
            router.push('/login');
          } else {
            addNotification(data.message || 'Verification failed', 'error');
          }
        } catch (error) {
          console.error('Verification error:', error);
          addNotification('An error occurred during verification', 'error');
        }
      }
    };
    
    verifyFromToken();
  }, [token, router, addNotification]);

  if (!user && !token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Verify Email - Best Garden Hotel</title>
        <meta name="description" content="Verify your email address" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="rounded-md bg-yellow-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      We've sent a verification link to <strong>{user?.email}</strong>. Please check your email and click the link to verify your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Redirecting to home page in {timeLeft} seconds...
            </p>

            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Home Page
              </Link>

              <Link
                href="/resend-verification"
                className="inline-block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Resend Verification Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}