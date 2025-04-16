import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import roomsData from '../data/rooms.json';
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
  
  // Calculate max price from rooms data
  const maxPrice = Math.max(...roomsData.rooms.map(room => room.price));
  
  // State for filter and sort options
  const [checkInDate, setCheckInDate] = useState('4/15/2025');
  const [checkOutDate, setCheckOutDate] = useState('04/16/2025');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [ratePreference, setRatePreference] = useState('Best Available ***');
  const [priceRange, setPriceRange] = useState([0, maxPrice]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortOption, setSortOption] = useState('Price (Low to High)');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [error, setError] = useState('');
  const [nights, setNights] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Function to handle price range slider changes
  const handlePriceRangeChange = (min, max) => {
    setPriceRange([min, max]);
  };

  // Read query parameters when the router is ready
  useEffect(() => {
    if (router.isReady) {
      // Apply query parameters if they exist
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

  // Apply filters and sort whenever the filter criteria change
  useEffect(() => {
    let results = [...roomsData.rooms];

    // Filter by room types if any selected
    if (selectedRoomTypes.length > 0) {
      results = results.filter(room => {
        const roomType = room.type.split(' ')[0].toLowerCase();
        return selectedRoomTypes.includes(roomType);
      });
    }

    // Filter by amenities if any selected
    if (selectedAmenities.length > 0) {
      results = results.filter(room => 
        selectedAmenities.every(amenity => 
          room.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    // Filter by price range
    results = results.filter(room => 
      room.price >= priceRange[0] && room.price <= priceRange[1]
    );

    // Filter by guest capacity
    results = results.filter(room => room.capacity >= guests);

    // Sort results
    if (sortOption === 'Price (Low to High)') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price (High to Low)') {
      results.sort((a, b) => b.price - a.price);
    }

    setFilteredRooms(results);
  }, [selectedRoomTypes, selectedAmenities, priceRange, guests, sortOption]);

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

  // Handle price slider change
  const handlePriceSliderChange = (e) => {
    const value = parseInt(e.target.value);
    const isMin = e.target.dataset.type === 'min';
    
    if (isMin) {
      if (value < priceRange[1]) {
        setPriceRange([value, priceRange[1]]);
      }
    } else {
      if (value > priceRange[0]) {
        setPriceRange([priceRange[0], value]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Search Results - Best Garden Hotel</title>
        <meta name="description" content="Search for rooms at Best Garden Hotel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

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
              <h3 className="font-semibold mb-4">Price</h3>
              <div className="relative h-2 mb-8">
                {/* Background track */}
                <div className="absolute h-full w-full bg-gray-200 rounded"></div>
                
                {/* Active track */}
                <div 
                  className="absolute h-full bg-amber-500 rounded"
                  style={{
                    left: `${(priceRange[0] / maxPrice) * 100}%`,
                    right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                  }}
                ></div>

                {/* Min handle */}
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[0]}
                  data-type="min"
                  onChange={handlePriceSliderChange}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />

                {/* Max handle */}
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  data-type="max"
                  onChange={handlePriceSliderChange}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />

                {/* Price labels */}
                <div className="absolute -bottom-8 left-0 transform -translate-x-1/2">
                  <span className="text-sm font-medium">${priceRange[0]}</span>
                </div>
                <div className="absolute -bottom-8 right-0 transform translate-x-1/2">
                  <span className="text-sm font-medium">${priceRange[1]}</span>
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
                    <Image   src="/images/play-svgrepo-com.svg" alt="arrow" width={10} height={10} />
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
          </div>
          
          {/* Results Section */}
          <div className="w-full md:w-3/4">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} found
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
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <div key={room.id} className="flex gap-6 bg-white">
                    {/* Room Image */}
                    <div className="w-80 h-48 relative">
                      <Image
                        src={room.image}
                        alt={room.type}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority={room.id <= 2}
                      />
                    </div>
                    
                    {/* Room Details */}
                    <div className="flex-1 py-2">
                      <h3 className="text-xl font-bold mb-2">{room.type}</h3>
                      <p className="text-gray-700 mb-4">{room.description}</p>
                      
                      {/* Amenities */}
                      <div className="text-gray-700 mb-4">
                        {room.amenities.join(', ')}
                      </div>
                      
                      {/* Price and Select Button */}
                      <div className="flex items-center justify-between">
                        <div className="text-right">
                          <span className="text-xl font-bold">${room.price} / night</span>
                        </div>
                        <Link href={`/room/${room.id}`}>
                          <button className="bg-[#1a2b3b] text-white px-6 py-2 rounded hover:bg-[#2c3e50] transition-colors">
                            Select Room
                          </button>
                        </Link>
                      </div>
                    </div>
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

      <footer className="bg-amber-500 text-center py-4 mt-8" style={{ backgroundColor: "#d4b053" }}>
        <p className="text-white">© 2025 BGH. All rights reserved.</p>
      </footer>
    </div>
  );
}
