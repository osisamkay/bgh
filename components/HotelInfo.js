import React from 'react';

export default function HotelInfo() {
  return (
    <div className="text-center my-6 sm:my-8 px-4">
      <h1 className="text-4xl font-bold mb-3">BEST GARDEN HOTEL</h1>
      <div className="flex justify-center items-center gap-3 mb-4">
        <div className="flex items-center bg-gray-800 text-white px-2 py-1 rounded">
          <span className="font-bold">4.5</span>
        </div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="font-medium text-lg">4.5/5</span>
        <span className="text-gray-600">1795 Reviews</span>
      </div>
    </div>
  );
}
