import React from 'react';

export default function SearchButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="bg-gray-900 text-white py-3 px-8 rounded font-medium hover:bg-gray-700 w-full"
    >
      SEARCH
    </button>
  );
}
