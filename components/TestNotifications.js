import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const TestNotifications = () => {
  const { addNotification } = useNotification();

  const handleTestNotification = (type) => {
    switch (type) {
      case 'success':
        addNotification('This is a success notification!', 'success');
        break;
      case 'error':
        addNotification('This is an error notification!', 'error');
        break;
      case 'warning':
        addNotification('This is a warning notification!', 'warning');
        break;
      case 'info':
        addNotification('This is an info notification!', 'info');
        break;
      default:
        addNotification('This is a default notification!', 'info');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Test Notifications</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleTestNotification('success')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Success
        </button>
        <button
          onClick={() => handleTestNotification('error')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Test Error
        </button>
        <button
          onClick={() => handleTestNotification('warning')}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Test Warning
        </button>
        <button
          onClick={() => handleTestNotification('info')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Info
        </button>
      </div>
    </div>
  );
};

export default TestNotifications; 