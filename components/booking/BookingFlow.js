import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import BookingDetails from './BookingDetails';
import SessionTimeout from './SessionTimeout';

const BookingFlow = ({ roomDetails }) => {
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotification();
  const [showTimeout, setShowTimeout] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(30);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check authentication status
  useEffect(() => {
    if (status === 'loading') {
      return; // Wait for session to load
    }

    if (status === 'unauthenticated' || !user) {
      // Store the current URL to redirect back after login
      const currentPath = router.asPath;
      addNotification('Please log in to book a room', 'info');
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [status, user, router, addNotification]);

  // Handle session timeout
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const timeElapsed = now - lastActivity;
      
      if (timeElapsed > 15 * 60 * 1000 && !showTimeout) { // 15 minutes
        setShowTimeout(true);
      }
    };

    const interval = setInterval(checkInactivity, 1000);
    return () => clearInterval(interval);
  }, [lastActivity, showTimeout]);

  // Handle timeout countdown
  useEffect(() => {
    if (showTimeout) {
      const timer = setInterval(() => {
        setTimeoutCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showTimeout, router]);

  // Update last activity on user interaction
  const updateActivity = () => {
    setLastActivity(Date.now());
    if (showTimeout) {
      setShowTimeout(false);
      setTimeoutCountdown(30);
    }
  };

  // Handle timeout response
  const handleTimeoutResponse = (stay) => {
    if (stay) {
      updateActivity();
    } else {
      router.push('/');
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading' || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the useEffect will handle the redirect
  if (status === 'unauthenticated' || !user) {
    return null;
  }

  return (
    <div onClick={updateActivity} onKeyPress={updateActivity}>
      {showTimeout && (
        <SessionTimeout
          countdown={timeoutCountdown}
          onResponse={handleTimeoutResponse}
        />
      )}
      <BookingDetails roomDetails={roomDetails} />
    </div>
  );
};

export default BookingFlow; 