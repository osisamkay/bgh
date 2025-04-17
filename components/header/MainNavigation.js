import React from 'react';
import Link from 'next/link';
import TranslatedText from '../TranslatedText';

const MainNavigation = ({ isMobile = false }) => {
  const navItems = [
    { key: 'offers', href: '/#offers' },
    { key: 'rooms_suites', href: '/#rooms' },
    { key: 'amenities', href: '/#amenities' },
    { key: 'group_events', href: '/#events' },
    { key: 'check_reservations', href: '/check-reservation' }
  ];

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-2 uppercase text-sm font-semibold">
        {navItems.map((item) => (
          <Link 
            key={item.key} 
            href={item.href} 
            className="text-gray-900 hover:text-white py-2"
          >
            <TranslatedText textKey={item.key} />
          </Link>
        ))}
        <Link href="/search">
          <button className="bg-gray-900 text-white uppercase text-sm font-semibold py-2 px-4 rounded mt-2 w-full">
            <TranslatedText textKey="book_reserve" />
          </button>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex space-x-4 lg:space-x-8 uppercase text-sm lg:text-base font-semibold">
      {navItems.map((item) => (
        <Link 
          key={item.key} 
          href={item.href} 
          className="text-gray-900 hover:text-white"
        >
          <TranslatedText textKey={item.key} />
        </Link>
      ))}
    </nav>
  );
};

export default MainNavigation;