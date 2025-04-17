import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';

const Header = () => {
  return (
    <>
      {/* Top Bar with Language and Login */}
      <div className="bg-[#f0f0e0]">
        <div className="container mx-auto border-b border-[#F5F5DC] flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-1">
          <div className="flex items-center space-x-4 sm:space-x-8 w-full sm:w-auto justify-center sm:justify-start mb-2 sm:mb-0">
            <a href="tel:1-888-675-7887" className="text-xs sm:text-sm font-medium">1-888-675-7887</a>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">CHAT WITH US</span>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-8 w-full sm:w-auto justify-center sm:justify-start">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-amber-500 py-2 sm:py-4" style={{ backgroundColor: "#d4b053" }}>
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
              {/* Use the actual BGH logo from the images directory */}
              <Image 
                src="/images/logo.svg" 
                alt="Best Garden Hotel" 
                width={100} 
                height={100} 
              />
            </div>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-900 hover:text-white"
            onClick={() => {
              const mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
              }
            }}
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-8 uppercase text-sm lg:text-base font-semibold">
            <Link href="#offers" className="text-gray-900 hover:text-white">OFFERS</Link>
            <Link href="#rooms" className="text-gray-900 hover:text-white">ROOMS & SUITES</Link>
            <Link href="#amenities" className="text-gray-900 hover:text-white">AMENITIES</Link>
            <Link href="#events" className="text-gray-900 hover:text-white">GROUP & EVENTS</Link>
            <Link href="/check-reservation" className="text-gray-900 hover:text-white">CHECK RESERVATIONS</Link>
          </nav>
          
          {/* Book Button */}
          <Link href="/search">
            <button className="hidden md:block bg-gray-900 text-white uppercase text-sm lg:text-base font-semibold py-2 px-4 lg:px-6 rounded">
              BOOK OR RESERVE
            </button>
          </Link>
        </div>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden px-4 py-2 mt-2 bg-amber-400 border-t border-amber-600">
          <nav className="flex flex-col space-y-2 uppercase text-sm font-semibold">
            <Link href="#offers" className="text-gray-900 hover:text-white py-2">OFFERS</Link>
            <Link href="#rooms" className="text-gray-900 hover:text-white py-2">ROOMS & SUITES</Link>
            <Link href="#amenities" className="text-gray-900 hover:text-white py-2">AMENITIES</Link>
            <Link href="#events" className="text-gray-900 hover:text-white py-2">GROUP & EVENTS</Link>
            <Link href="/check-reservation" className="text-gray-900 hover:text-white py-2">CHECK RESERVATIONS</Link>
            <Link href="/room">
              <button className="bg-gray-900 text-white uppercase text-sm font-semibold py-2 px-4 rounded mt-2 w-full">
                BOOK OR RESERVE
              </button>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;