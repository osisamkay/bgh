import React from 'react';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function MyApp({ Component, pageProps }) {
  // List of paths that don't need the layout
  const noLayoutPages = ['/login', '/register', '/reset-password'];
  const shouldUseLayout = !noLayoutPages.includes(Component.pathname);

  return (
    <React.StrictMode>
      <LanguageProvider>
        <NotificationProvider>
          <AuthProvider>
            {shouldUseLayout ? (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            ) : (
              <Component {...pageProps} />
            )}
          </AuthProvider>
        </NotificationProvider>
      </LanguageProvider>
    </React.StrictMode>
  );
}