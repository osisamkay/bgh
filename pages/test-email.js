import { useState } from 'react';
import EmailPreview from '../components/notifications/EmailPreview';

export default function TestEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailDetails, setEmailDetails] = useState(null);
  const [error, setError] = useState(null);

  const handleTestEmail = async () => {
    setIsLoading(true);
    setError(null);
    setEmailDetails(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setEmailDetails(data.emailDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Email Test Page
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Test the email functionality using Ethereal
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleTestEmail}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Sending...' : 'Send Test Email'}
          </button>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {emailDetails && (
            <div className="mt-4 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Email Sent Successfully
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Ethereal Account Details:</p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Username: {emailDetails.etherealUser}</li>
                    <li>Password: {emailDetails.etherealPass}</li>
                    <li>
                      Message ID: <code>{emailDetails.messageId}</code>
                    </li>
                  </ul>
                </div>
                <div className="mt-3">
                  <a
                    href={emailDetails.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Email Preview
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {emailDetails?.previewUrl && (
        <EmailPreview
          previewUrl={emailDetails.previewUrl}
          onClose={() => setEmailDetails(null)}
        />
      )}
    </div>
  );
} 