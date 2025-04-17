import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaAngleDown } from 'react-icons/fa';

const UserAccountMenu = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-sm font-medium hover:text-gray-700"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="text-sm font-medium bg-[#1A2A2F] text-white px-4 py-2 rounded hover:bg-[#2C3F46] transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-sm font-medium hover:text-gray-700 focus:outline-none"
      >
        <div className="flex items-center">
          <FaUser className="w-5 h-5 text-gray-600" />
          <span className="ml-2">Hello, {user.firstName}</span>
          <FaAngleDown className={`w-4 h-4 ml-1 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-[#F5F4F0] rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium">Hello, {user.firstName}</p>
          </div>
          
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            Profile
          </Link>
          
          <Link
            href="/my-reservation"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            My Reservation
          </Link>
          
          <Link
            href="/my-bookings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            My Bookings
          </Link>
          
          <Link
            href="/message-center"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            Message Center
          </Link>
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAccountMenu;