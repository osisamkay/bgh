import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

const EmailPreview = ({ url, onClose }) => {
  if (!url) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200 z-50"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Email Preview URL:</p>
          <div className="break-all text-blue-600 hover:text-blue-800">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm">
              {url}
            </a>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => window.open(url, '_blank')}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Open Preview
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setPreviewUrl(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send test email');
      }

      setResult(data);
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      console.error('Error sending test email:', err);
      setError(err.message || 'An error occurred while sending the test email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head>
        <title>Test Email Functionality - BGH</title>
      </Head>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Test Email Functionality</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter test email address"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {result && !error && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success:</strong>
            <span className="block sm:inline"> Test email sent successfully!</span>
            
            {result.messageId && (
              <p className="text-sm mt-2">
                <strong>Message ID:</strong> {result.messageId}
              </p>
            )}
            
            {result.etherealUser && (
              <div className="text-sm mt-2">
                <p><strong>Ethereal Account:</strong></p>
                <p>Username: {result.etherealUser}</p>
                <p>Password: {result.etherealPass}</p>
                <p className="text-xs text-gray-500 mt-1">
                  (You can use these credentials to check the sent emails at <a href="https://ethereal.email" target="_blank" rel="noopener noreferrer" className="underline">ethereal.email</a>)
                </p>
              </div>
            )}
            
            {previewUrl && (
              <p className="mt-2">
                <button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="text-sm bg-green-700 text-white px-2 py-1 rounded-md hover:bg-green-800 transition-colors"
                >
                  View Email Preview
                </button>
              </p>
            )}
          </div>
        )}
      </div>
      
      {previewUrl && (
        <EmailPreview
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}