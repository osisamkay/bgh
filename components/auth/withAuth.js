// components/auth/withAuth.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Higher Order Component for protecting routes that require authentication
 * @param {Component} Component - The component to wrap with authentication
 * @param {Object} options - Configuration options
 * @param {boolean} options.adminRequired - Whether admin access is required
 */
export default function withAuth(Component, options = {}) {
    const { adminRequired = false } = options;

    const AuthenticatedComponent = (props) => {
        const router = useRouter();
        const { user, loading, mounted } = useAuth();
        const [isAuthorized, setIsAuthorized] = useState(false);
        const [checkingAuth, setCheckingAuth] = useState(true);

        useEffect(() => {
            // Don't do anything until auth context is mounted
            if (!mounted) return;

            if (!loading) {
                // If not loading anymore, we can check the user state
                if (!user) {
                    // No user, redirect to login
                    router.replace({
                        pathname: '/login',
                        query: { returnUrl: router.asPath }
                    });
                } else if (adminRequired && user.role !== 'ADMIN') {
                    // User exists but isn't admin and admin is required
                    router.replace('/');
                } else {
                    // User exists and has proper permissions
                    setIsAuthorized(true);
                }

                setCheckingAuth(false);
            }
        }, [user, loading, mounted, router]);

        // Show loading if checking auth or auth context is loading
        if (checkingAuth || loading) {
            return (
                <div className="min-h-screen flex justify-center items-center">
                    <LoadingSpinner />
                </div>
            );
        }

        // If authorized, render the component
        return isAuthorized ? <Component {...props} /> : null;
    };

    // Copy getInitialProps so it will be executed
    if (Component.getInitialProps) {
        AuthenticatedComponent.getInitialProps = Component.getInitialProps;
    }

    return AuthenticatedComponent;
}