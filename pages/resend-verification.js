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
                className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200"
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

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const handleResendVerification = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: user.email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification email');
            }

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
                <title>Resend Verification Email</title>
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
                            <p className="text-sm text-gray-600 mb-6">
                                Click the button below to receive a new verification email.
                            </p>
                            <button
                                onClick={handleResendVerification}
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                            <div className="mt-6">
                                <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
                                    Return to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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