import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  // List of paths that don't need the full layout (like login/register pages)
  const minimalistPages = ['/login', '/register', '/reset-password'];
  const isMinimalistPage = minimalistPages.includes(router.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main >
        {/* Notification Container - Fixed position for app-wide notifications */}
        <div className="fixed top-20 right-4 z-50" id="notification-container"></div>
        
        {/* Page Content */}
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button - Shows when scrolled down */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-amber-500 text-white p-2 rounded-full shadow-lg hover:bg-amber-600 transition-opacity duration-200 opacity-0 invisible scroll-to-top"
        aria-label="Scroll to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

      {/* Add scroll listener for scroll-to-top button */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('scroll', () => {
            const scrollButton = document.querySelector('.scroll-to-top');
            if (scrollButton) {
              if (window.pageYOffset > 300) {
                scrollButton.classList.remove('opacity-0', 'invisible');
                scrollButton.classList.add('opacity-100', 'visible');
              } else {
                scrollButton.classList.add('opacity-0', 'invisible');
                scrollButton.classList.remove('opacity-100', 'visible');
              }
            }
          });
        `
      }} />
    </div>
  );
};

export default Layout; 