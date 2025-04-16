import { NotificationProvider } from '../context/NotificationContext';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <Component {...pageProps} />
    </NotificationProvider>
  );
}

export default MyApp