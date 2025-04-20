import React from 'react';
import Link from 'next/link';

const ReservationSuccess = ({ reservation, emailPreviewUrl }) => {
  const expiresAt = new Date(reservation.expiresAt);
  const timeLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60)); // minutes left
  console.log(timeLeft)

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
      <div className="text-center mb-6">
        <svg
          className="mx-auto h-12 w-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Great news! Your room is reserved
        </h2>
        <p className="mt-2 text-gray-600">
          Your reservation is valid for 1 hour. Book now to secure this price.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Reservation Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Room</p>
            <p className="font-medium">{reservation.roomId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Check-in</p>
            <p className="font-medium">{reservation.checkInDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Check-out</p>
            <p className="font-medium">{reservation.checkOutDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Guests</p>
            <p className="font-medium">{reservation.numberOfGuests}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link
          href={`/`}
          // href={`/register?reservationId=${reservation.id}`}
          className="btn bg-gray-900 text-white w-full md:w-1/3 text-center"
        >
          Back to Homepage
        </Link>
        <button
          onClick={() => window.print()}
          className="btn btn-secondary w-full md:w-1/3 text-center"
        >
          Print Reservation
        </button>
      </div>

      {emailPreviewUrl && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            We've sent you a confirmation email. Click below to preview it:
          </p>
          <a
            href={emailPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View Email Confirmation
          </a>
        </div>
      )}
    </div>
  );
};

export default ReservationSuccess; 