import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Image from 'next/image';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";

// Utility functions for date formatting
const formatDateForDisplay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
};

const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function Search() {
  const router = useRouter();

  // State for filter and sort options
  const [checkInDate, setCheckInDate] = useState(formatDateForDisplay(Date.now()));
  const [checkOutDate, setCheckOutDate] = useState(formatDateForDisplay(Date.now() + 1000 * 60 * 60 * 24));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [ratePreference, setRatePreference] = useState('Best Available ***');
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortOption, setSortOption] = useState('Price (Low to High)');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [error, setError] = useState('');
  const [nights, setNights] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);
  const [email, setEmail] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add state for selected room and image gallery
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const data = await response.json();
        console.log(data);
        // Initialize with empty arrays if data is undefined
        const roomsData = data?.data || [];
        setAllRooms(roomsData);
        setFilteredRooms(roomsData);

        // Set max price from fetched rooms
        const maxPrice = roomsData.length > 0
          ? Math.max(...roomsData.map(room => room.price))
          : 0;
        setPriceRange([0, maxPrice]);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Calculate max price from filtered rooms
  const maxPrice = filteredRooms && filteredRooms.length > 0
    ? Math.max(...filteredRooms.map(room => room.price))
    : 0;

  // Filter rooms by price and other criteria
  useEffect(() => {
    if (!allRooms || allRooms.length === 0) return;

    let results = [...allRooms];

    // Filter by room types if any selected
    if (selectedRoomTypes.length > 0) {
      results = results.filter(room => {
        const roomType = room.type.toLowerCase();
        return selectedRoomTypes.includes(roomType);
      });
    }

    // Filter by amenities if any selected
    if (selectedAmenities.length > 0) {
      results = results.filter(room => {
        const roomAmenities = JSON.parse(room.amenities || '[]');
        return selectedAmenities.every(amenity =>
          roomAmenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        );
      });
    }

    // Filter by price range
    results = results.filter(room =>
      room.price >= priceRange[0] && room.price <= priceRange[1]
    );

    // Sort results
    if (sortOption === 'Price (Low to High)') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price (High to Low)') {
      results.sort((a, b) => b.price - a.price);
    }

    setFilteredRooms(results);
  }, [selectedRoomTypes, selectedAmenities, priceRange, sortOption, allRooms]);

  // Read query parameters when the router is ready
  useEffect(() => {
    if (router.isReady) {
      if (router.query.checkIn) setCheckInDate(router.query.checkIn);
      if (router.query.checkOut) setCheckOutDate(router.query.checkOut);
      if (router.query.rooms) setRooms(parseInt(router.query.rooms));
      if (router.query.guests) setGuests(parseInt(router.query.guests));
      if (router.query.rate) setRatePreference(router.query.rate);
    }
  }, [router.isReady, router.query]);

  // Update nights when dates change
  useEffect(() => {
    const updatedNights = calculateNights(checkInDate, checkOutDate);
    if (updatedNights > 0) {
      setNights(updatedNights);
    }
  }, [checkInDate, checkOutDate]);

  // Handle clicks outside the date picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle room type selection
  const toggleRoomType = (type) => {
    if (selectedRoomTypes.includes(type)) {
      setSelectedRoomTypes(selectedRoomTypes.filter(t => t !== type));
    } else {
      setSelectedRoomTypes([...selectedRoomTypes, type]);
    }
  };

  // Toggle amenity selection
  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Handle date changes
  const handleCheckInChange = (e) => {
    const inputDate = e.target.value;
    const formattedDate = formatDateForDisplay(inputDate);
    setCheckInDate(formattedDate);
  };

  const handleCheckOutChange = (e) => {
    const inputDate = e.target.value;
    const formattedDate = formatDateForDisplay(inputDate);
    setCheckOutDate(formattedDate);
  };

  // Validate dates
  const validateDates = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn >= checkOut) {
      setError('Check-out date must be after check-in date');
      return false;
    }
    if (checkIn < today) {
      setError('Check-in date cannot be in the past');
      return false;
    }
    setError('');
    return true;
  };

  // Update search parameters (dates and room/guest count)
  const updateSearch = () => {
    if (!validateDates()) return;

    // Apply current search parameters to URL
    router.push({
      pathname: '/search',
      query: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        rooms: rooms,
        guests: guests,
        rate: ratePreference
      }
    }, undefined, { shallow: true });
  };

  // Add subscription handler
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubscribing(true);
    setNotificationStatus('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          priceRange,
          roomType: selectedRoomTypes.length > 0 ? selectedRoomTypes.join(', ') : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotificationStatus('success');
        setEmail('');
        // Store the preview URL in state
        if (data.emailPreview) {
          window.open(data.emailPreview, '_blank');
        }
      } else {
        setNotificationStatus('error');
      }
    } catch (error) {
      setNotificationStatus('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Function to handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room === selectedRoom ? null : room);
    setCurrentImageIndex(0);
  };

  // Function to navigate images
  const handleImageNavigation = (direction) => {
    if (!selectedRoom) return;

    if (direction === 'next') {
      setCurrentImageIndex((prev) =>
        prev === selectedRoom.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedRoom.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Search Results - Best Garden Hotel</title>
        <meta name="description" content="Search for rooms at Best Garden Hotel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>



      {/* Search Form - Styled to match the image */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="flex flex-col" ref={datePickerRef}>
            <label className="text-sm text-gray-700 mb-1">Check-in-Date</label>
            <div className="relative">
              <div
                className="border border-gray-300 p-2 w-full bg-gray-100 rounded cursor-pointer"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {checkInDate}
              </div>
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-2 bg-white p-4 shadow-xl rounded-lg z-50 w-64 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Your Dates</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                      <input
                        type="date"
                        value={formatDateForInput(checkInDate)}
                        onChange={handleCheckInChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                      <input
                        type="date"
                        value={formatDateForInput(checkOutDate)}
                        onChange={handleCheckOutChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply Dates
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Check-out-Date</label>
            <div className="relative">
              <div className="border border-gray-300 p-2 w-full bg-gray-100 rounded">
                {checkOutDate}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Rooms</label>
            <div className="relative">
              <select
                value={rooms}
                onChange={(e) => setRooms(parseInt(e.target.value))}
                className="border border-gray-300 p-2 w-full appearance-none bg-gray-100 rounded pr-8"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Guests</label>
            <div className="relative">
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="border border-gray-300 p-2 w-full appearance-none bg-gray-100 rounded pr-8"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Rate Preference</label>
            <div className="relative">
              <select
                value={ratePreference}
                onChange={(e) => setRatePreference(e.target.value)}
                className="border border-gray-300 p-2 w-full appearance-none bg-gray-100 rounded pr-8"
              >
                <option value="Best Available ***">Best Available ***</option>
                <option value="AAA Rate">AAA Rate</option>
                <option value="Senior Rate">Senior Rate</option>
                <option value="Military Rate">Military Rate</option>
                <option value="Government Rate">Government Rate</option>
              </select>
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={updateSearch}
              className="bg-gray-800 text-white px-6 py-2 rounded font-medium hover:bg-gray-700 transition-colors"
            >
              UPDATE SEARCH
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Section */}
          <div className="w-full md:w-1/4">
            <h2 className="text-xl font-bold mb-6">Filter</h2>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Price Range</h3>
              <div className="relative">
                <style jsx>{`
                  input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    background: transparent;
                  }
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 18px;
                    width: 18px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    background: transparent;
                    cursor: pointer;
                    pointer-events: auto;
                    margin-top: -6px;
                  }
                  input[type="range"]::-moz-range-thumb {
                    height: 18px;
                    width: 18px;
                    border-radius: 50%;
                    border: 2px solid #d4af37;
                    background: #d4af37;
                    cursor: pointer;
                    pointer-events: auto;
                  }
                `}</style>
                <div className="relative h-[50px]">
                  {/* Track with values */}
                  <div className="absolute w-full h-[24px] top-1/2 -translate-y-1/2  rounded-full flex items-center px-2 text-xs">
                    <div className="relative w-full h-full flex items-center">
                      {/* Background track */}
                      <div className="absolute w-full h-[10px] bg-gray-200 rounded-full"></div>

                      {/* Selected range */}
                      <div
                        className="absolute h-[10px] bg-[#d4af37] rounded-full"
                        style={{
                          left: `${(priceRange[0] / maxPrice) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`
                        }}
                      ></div>

                      {/* Price labels */}
                      <div
                        className="absolute text-[12px] bg-white px-2 py-1 rounded-full border border-gray-300 font-medium"
                        style={{ left: `${(priceRange[0] / maxPrice) * 100}%`, transform: 'translateX(-50%)' }}
                      >
                        ${priceRange[0]}
                      </div>
                      <div
                        className="absolute text-[12px] bg-white px-2 py-1 rounded-full border border-gray-300 font-bold"
                        style={{ left: `${(priceRange[1] / maxPrice) * 100}%`, transform: 'translateX(-50%)' }}
                      >
                        ${priceRange[1]}
                      </div>
                    </div>
                  </div>

                  {/* Range inputs */}
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), priceRange[1] - 1);
                      setPriceRange([value, priceRange[1]]);
                    }}
                    className="absolute w-full top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ zIndex: 1 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Math.max(Number(e.target.value), priceRange[0] + 1);
                      setPriceRange([priceRange[0], value]);
                    }}
                    className="absolute w-full top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ zIndex: 2 }}
                  />
                </div>
              </div>
            </div>

            {/* Room Type Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Room Type</h3>
              <div className="space-y-2">
                {['Single', 'Twin', 'Deluxe', 'King'].map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={selectedRoomTypes.includes(type.toLowerCase())}
                      onChange={() => toggleRoomType(type.toLowerCase())}
                      className="h-4 w-4 mr-2"
                    />
                    <label htmlFor={`type-${type}`} className="text-sm flex-grow">{type}</label>
                    <Image src="/images/play-svgrepo-com.svg" alt="arrow" width={10} height={10} />
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Amenities</h3>
              <div className="space-y-2">
                {['Wi-Fi', 'Pool', 'Breakfast', 'Room Service'].map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={selectedAmenities.includes(amenity.toLowerCase())}
                      onChange={() => toggleAmenity(amenity.toLowerCase())}
                      className="h-4 w-4 mr-2"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="text-sm flex-grow">{amenity}</label>
                    <Image src="/images/play-svgrepo-com.svg" alt="arrow" width={10} height={10} />
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Filters Button */}
            <button
              onClick={() => {
                setSelectedRoomTypes([]);
                setSelectedAmenities([]);
                setPriceRange([0, maxPrice]);
                setGuests(1);
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              Reset all filters
            </button>

            {/* Email Notification Form */}
            <div className="mt-8 p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Price Alert Notifications</h3>
              <form onSubmit={handleSubscribe}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className={`w-full bg-[#d4af37] text-white py-2 px-4 rounded-md hover:bg-[#c4a137] transition-colors ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isSubscribing ? 'Subscribing...' : 'Get Price Alerts'}
                </button>
                {notificationStatus === 'success' && (
                  <p className="mt-2 text-sm text-green-600">
                    Successfully subscribed to price alerts!
                  </p>
                )}
                {notificationStatus === 'error' && (
                  <p className="mt-2 text-sm text-red-600">
                    Error subscribing to alerts. Please try again.
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="w-full md:w-3/4">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {filteredRooms?.length} {filteredRooms?.length === 1 ? 'room' : 'rooms'} found
              </p>
              <div className="flex items-center">
                <span className="mr-2 text-sm">Sort by</span>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border border-gray-300 rounded p-1 pl-2 pr-8 appearance-none"
                  >
                    <option>Price (Low to High)</option>
                    <option>Price (High to Low)</option>
                  </select>
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamically Generated Room Results */}
            <div className="space-y-6">
              {filteredRooms?.length > 0 ? (
                filteredRooms?.map((room) => (
                  <div key={room.id} className="flex flex-col bg-white border rounded-lg overflow-hidden mb-6">
                    <div className="flex gap-6 p-4">
                      {/* Room Image */}
                      <div
                        className="w-80 h-48 relative cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => handleRoomSelect(room)}
                      >
                        <Image
                          src={room.images?.[0] || room.image || '/images/room-placeholder.svg'}
                          alt={room.type}
                          fill
                          style={{ objectFit: 'cover' }}
                          priority={room.id <= 2}
                          className="hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/images/room-placeholder.svg';
                          }}
                        />
                        {room.images?.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                            {room.images.length} photos
                          </div>
                        )}
                      </div>

                      {/* Room Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{room.type}</h3>
                        <p className="text-gray-700 mb-4">{room.description}</p>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(Array.isArray(room?.amenities) ? room.amenities : []).map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
                              {amenity}
                            </span>
                          ))}
                        </div>

                        {/* Price and Select Button */}
                        <div className="flex items-center justify-between">
                          <div className="text-right">
                            <span className="text-xl font-bold">${room.price}</span>
                            <span className="text-gray-600 ml-1">/ night</span>
                          </div>
                          <Link
                            href={{
                              pathname: `/room/${room.id}`,
                              query: {
                                checkIn: checkInDate,
                                checkOut: checkOutDate,
                                guests: guests
                              }
                            }}
                          >
                            <button className="bg-[#1a2b3b] text-white px-6 py-2 rounded hover:bg-[#2c3e50] transition-colors">
                              Select Room
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Image Gallery - Shows when room is selected */}
                    {selectedRoom && selectedRoom.id === room.id && room.images?.length > 0 && (
                      <div className="border-t">
                        <div className="relative h-96">
                          <Image
                            src={room.images[currentImageIndex]}
                            alt={`${room.type} view ${currentImageIndex + 1}`}
                            fill
                            style={{ objectFit: 'cover' }}
                          />

                          {/* Navigation arrows - only show if there are multiple images */}
                          {room.images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageNavigation('prev');
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageNavigation('next');
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </>
                          )}

                          {/* Image counter */}
                          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {room.images.length}
                          </div>
                        </div>

                        {/* Thumbnail strip - only show if there are multiple images */}
                        {room.images.length > 1 && (
                          <div className="flex gap-2 p-4 overflow-x-auto">
                            {room.images.map((image, index) => (
                              <div
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`relative w-20 h-20 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden ${currentImageIndex === index ? 'ring-2 ring-[#d4af37]' : ''
                                  }`}
                              >
                                <Image
                                  src={image}
                                  alt={`${room.type} thumbnail ${index + 1}`}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-gray-300 rounded">
                  <h3 className="text-xl font-semibold">No rooms found matching your criteria</h3>
                  <p className="text-gray-600 mt-2">Try adjusting your filters</p>
                  <button
                    onClick={() => {
                      setSelectedRoomTypes([]);
                      setSelectedAmenities([]);
                      setPriceRange([0, maxPrice]);
                      setGuests(1);
                    }}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
