import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmailPreview({ previewUrl, onClose, reservationId }) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (previewUrl) {
      setIsVisible(true);
      setTimeLeft(300);
    }
  }, [previewUrl]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleClose();
    }
  }, [timeLeft]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 200); // Wait for animation to complete
  };

  const handlePreviewClick = () => {
    window.open(previewUrl, '_blank');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 w-[calc(100%-2rem)] sm:w-[440px] max-w-md bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 bg-amber-50 p-1.5 sm:p-2 rounded-lg">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    Reservation Confirmation
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    Reservation ID: {reservationId}
                  </p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200 -mr-1 sm:mr-0"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={handlePreviewClick}
                className="w-full bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>View Confirmation Email</span>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>

              <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Preview expires in {formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 sm:h-1 bg-gray-100">
            <div
              className="h-full bg-amber-600 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 300) * 100}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 