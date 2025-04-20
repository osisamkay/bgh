import { Providers } from '../contexts/Providers';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { LanguageProvider } from '../contexts/LanguageContext';
import 'react-notifications/lib/notifications.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

export default function MyApp({ Component, pageProps }) {
  // List of paths that don't need the layout
  const noLayoutPages = ['/login', '/register', '/reset-password'];
  const shouldUseLayout = !noLayoutPages.includes(Component.pathname);

  // Create a client
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Providers session={pageProps.session}>
        <LanguageProvider>
          {shouldUseLayout ? (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          ) : (
            <Component {...pageProps} />
          )}
        </LanguageProvider>
      </Providers>
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}