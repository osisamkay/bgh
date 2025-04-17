import React from 'react';
import Link from 'next/link';
import TranslatedText from '../TranslatedText';

const BookButton = () => {
  return (
    <Link href="/register?redirect=/search">
      <button className="hidden md:block bg-gray-900 text-white uppercase text-sm lg:text-base font-semibold py-2 px-4 lg:px-6 rounded hover:bg-gray-800 transition-colors">
        <TranslatedText textKey="book_reserve" />
      </button>
    </Link>
  );
};

export default BookButton;