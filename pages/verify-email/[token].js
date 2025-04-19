import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerification = () => {
  const router = useRouter();
  const { token } = router.query;
  const { verifyEmail } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState({
    isLoading: true,
    success: false,
    message: ''
  });

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) return;

      try {
        const result = await verifyEmail(token);
        
        setVerificationStatus({
          isLoading: false,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          // Redirect to login page after 3 seconds on success
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (error) {
        setVerificationStatus({
          isLoading: false,
          success: false,
          message: 'An error occurred during email verification. Please try again.'
        });
      }
    };

    verifyEmailToken();
  }, [token, verifyEmail, router]);

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col">
      <Head>
        <title>Email Verification - Best Garden Hotel</title>
        <meta name="description" content="Verify your email address for BGH membership" />
      </Head>

      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Email Verification</h1>
          
          {verificationStatus.isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A2A2F] mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your email address...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className={`mb-6 ${verificationStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {verificationStatus.success ? (
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <p className="text-lg mb-4">{verificationStatus.message}</p>
                
                {verificationStatus.success ? (
                  <p className="text-gray-600">
                    Redirecting you to login page...
                  </p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      You can try the following:
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      <li>Check if you're using the correct verification link</li>
                      <li>Request a new verification email</li>
                      <li>Contact our support team for assistance</li>
                    </ul>
                    <div className="pt-4">
                      <Link 
                        href="/login"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Return to Login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-[#c8a750] py-4 text-center">
        <p>© 2025 BGH. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default EmailVerification; 