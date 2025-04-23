import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const EmailPreviewUrl = ({ url, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 300000); // 5 minutes

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200 z-50"
            >
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">Verification Link:</p>
                    <div className="break-all text-blue-600 hover:text-blue-800">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm">
                            {url}
                        </a>
                    </div>
                </div>
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={() => window.open(url, '_blank')}
                        className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Open Link
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const ResendVerification = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [countdown, setCountdown] = useState(0); // Countdown timer for resend button

    useEffect(() => {
        // Check auth status and redirect if needed
        if (!user) {
            router.push('/login');
            return;
        }

        // If user is already verified, redirect home
        if (user.emailVerified) {
            addNotification('Your email is already verified', 'info');
            router.push('/');
        }
    }, [user, router, addNotification]);

    // Handle countdown for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendVerification = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification email');
            }

            // Start countdown to prevent spam
            setCountdown(60); // 60 seconds cooldown

            addNotification('Verification email sent successfully', 'success');
            if (data.previewUrl) {
                setPreviewUrl(data.previewUrl);
            }
        } catch (error) {
            console.error('Error resending verification:', error);
            addNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Resend Verification Email - Best Garden Hotel</title>
                <meta name="description" content="Resend your email verification link" />
            </Head>

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Resend Verification Email
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
                                    <div className="ml-3 text-left">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Email Verification Needed
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>
                                                Your email <strong>{user.email}</strong> needs to be verified. Click the button below to receive a new verification email.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">
                                If you don't see the verification email in your inbox, please check your spam folder.
                            </p>
                            
                            <button
                                onClick={handleResendVerification}
                                disabled={loading || countdown > 0}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loading || countdown > 0) ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Sending...' : 
                                 countdown > 0 ? `Resend available in ${countdown}s` : 
                                 'Resend Verification Email'}
                            </button>
                            
                            <div className="mt-6 flex justify-between">
                                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                                    Back to Login
                                </Link>
                                <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
                                    Return to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add EmailPreview component */}
            {previewUrl && (
                <EmailPreviewUrl
                    url={previewUrl}
                    onClose={() => setPreviewUrl(null)}
                />
            )}
        </>
    );
};

export default ResendVerification;