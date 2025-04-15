import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <>
      {/* Top Bar with Language and Login */}
      <div className="bg-[#f0f0e0] border-b border-[#C9C306] flex justify-end items-center px-6 py-1">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-6">ENGLISH</span>
          <span className="text-sm font-medium">CREATE ACCOUNT OR LOGIN</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-amber-500 py-4" >
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-32 h-32 flex items-center justify-center">
              {/* Custom hexagonal logo similar to the image */}
              <Image src="/images/image.png" alt="alt" width={100} height={100} />
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 uppercase text-base font-semibold">
            <Link href="#offers" className="text-gray-900 hover:text-white">OFFERS</Link>
            <Link href="#rooms" className="text-gray-900 hover:text-white">ROOMS & SUITES</Link>
            <Link href="#amenities" className="text-gray-900 hover:text-white">AMENITIES</Link>
            <Link href="#events" className="text-gray-900 hover:text-white">GROUP & EVENTS</Link>
            <Link href="#reservations" className="text-gray-900 hover:text-white">CHECK RESERVATIONS</Link>
          </nav>
          
          {/* Book Button */}
          <button className="bg-gray-900 text-white uppercase text-base font-semibold py-2 px-6 rounded">
            BOOK OR RESERVE
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;