import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { addNotification } = useNotification();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timeout instead of 60 seconds
  const [token, setToken] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
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
    // Only start countdown if verification is not in progress
    if (verificationStatus !== 'loading') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Only redirect if verification is not in progress
            if (verificationStatus !== 'loading') {
              router.push('/');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, router, addNotification, verificationStatus]);

  // Handle verification from URL token
  useEffect(() => {
    const verifyFromToken = async () => {
      if (token) {
        setVerificationStatus('loading');
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
            setVerificationStatus('success');
            addNotification('Email verified successfully!', 'success');
            
            // If we have login tokens, log the user in automatically
            if (data.token && data.refreshToken) {
              localStorage.setItem('access_token', data.token);
              localStorage.setItem('refresh_token', data.refreshToken);
              
              // Redirect after a short delay to show success message
              setTimeout(() => {
                router.push('/');
              }, 2000);
            } else {
              // Otherwise redirect to login
              setTimeout(() => {
                router.push('/login');
              }, 2000);
            }
          } else {
            setVerificationStatus('error');
            setErrorMessage(data.message || 'Verification failed');
            addNotification(data.message || 'Verification failed', 'error');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          setErrorMessage('An error occurred during verification');
          addNotification('An error occurred during verification', 'error');
        }
      }
    };
    
    verifyFromToken();
  }, [token, router, addNotification]);

  // Show loading if no user and no token yet
  if (!user && !token && verificationStatus === 'idle') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Verify Email - Best Garden Hotel</title>
        <meta name="description" content="Verify your email address" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {verificationStatus === 'loading' ? 'Verifying Your Email...' : 
           verificationStatus === 'success' ? 'Email Verified!' :
           verificationStatus === 'error' ? 'Verification Failed' : 'Verify Your Email'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {verificationStatus === 'loading' && (
              <div className="rounded-md bg-blue-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="#ccc" strokeDasharray="32" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeDasharray="4 28" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Verifying your email address...
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Please wait while we verify your email.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Email Verification Successful
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your email has been verified successfully! You can now access all features of Best Garden Hotel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-8a1 1 0 112 0v4a1 1 0 11-2 0V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Verification Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        {errorMessage || "We couldn't verify your email. The verification link may have expired or been used already."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus === 'idle' && user && !user.emailVerified && (
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
            )}

            {verificationStatus !== 'loading' && (
              <p className="text-sm text-gray-600 mb-4">
                {verificationStatus !== 'success' && verificationStatus !== 'error' && 
                  `Redirecting to home page in ${timeLeft} seconds...`}
              </p>
            )}

            <div className="space-y-4">
              {(verificationStatus === 'idle' || verificationStatus === 'error') && (
                <Link
                  href="/resend-verification"
                  className="inline-block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Resend Verification Email
                </Link>
              )}

              <Link
                href="/"
                className="inline-block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Home Page
              </Link>

              {verificationStatus === 'error' && (
                <Link
                  href="/login"
                  className="inline-block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Go to Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}