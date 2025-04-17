import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '../../contexts/NotificationContext';
import BookingDetails from './BookingDetails';
import SessionTimeout from './SessionTimeout';

const BookingFlow = ({ roomDetails }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [showTimeout, setShowTimeout] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(30);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check authentication status
  useEffect(() => {
    if (status === 'unauthenticated') {
      showNotification('Please create an account to book a room', 'info');
      router.push('/register?redirect=/booking');
    }
  }, [status, router, showNotification]);

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

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect to register page
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