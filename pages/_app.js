import { Providers } from '../contexts/Providers';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import 'react-notifications/lib/notifications.css';

export default function MyApp({ Component, pageProps }) {
  // List of paths that don't need the layout
  const noLayoutPages = ['/login', '/register', '/reset-password'];
  const shouldUseLayout = !noLayoutPages.includes(Component.pathname);

  return (
    <Providers session={pageProps.session}>
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
    </Providers>
  );
}