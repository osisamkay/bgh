import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { NotificationManager, NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

// Type definitions for better code maintainability
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Export the context so it can be imported directly if needed
const NotificationContext = createContext({
  addNotification: () => {},
});

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  // Use useCallback to memoize the addNotification function
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        NotificationManager.success(message, 'Success', 3000);
        break;
      case NOTIFICATION_TYPES.ERROR:
        NotificationManager.error(message, 'Error', 3000);
        break;
      case NOTIFICATION_TYPES.WARNING:
        NotificationManager.warning(message, 'Warning', 3000);
        break;
      case NOTIFICATION_TYPES.INFO:
        NotificationManager.info(message, 'Info', 3000);
        break;
      default:
        NotificationManager.info(message, 'Info', 3000);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    addNotification
  }), [addNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
} 