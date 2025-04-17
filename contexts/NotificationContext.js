import React, { createContext, useContext, useState } from 'react';

// Export the context so it can be imported directly if needed
const NotificationContext = createContext({});

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-4">
        {notifications.map(({ id, message, type }) => {
          let bgColor = '';
          switch (type) {
            case 'success':
              bgColor = 'bg-green-500';
              break;
            case 'error':
              bgColor = 'bg-red-500';
              break;
            case 'warning':
              bgColor = 'bg-yellow-500';
              break;
            default:
              bgColor = 'bg-blue-500';
          }

          return (
            <div
              key={id}
              className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-md animate-slide-in`}
            >
              <p className="flex-1 mr-4">{message}</p>
              <button
                onClick={() => removeNotification(id)}
                className="text-white hover:opacity-80 focus:outline-none transition-opacity"
                aria-label="Close notification"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
} 