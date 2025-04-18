import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NotificationProvider>
    </SessionProvider>
  );
} 