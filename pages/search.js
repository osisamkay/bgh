import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import roomsData from '../data/rooms.json';

export default function Search() {
  const router = useRouter();
  
  // State for filter and sort options
  const [checkInDate, setCheckInDate] = useState('07/07/2025');
  const [checkOutDate, setCheckOutDate] = useState('07/17/2025');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [ratePreference, setRatePreference] = useState('Best Available ***');
  const [priceRange, setPriceRange] = useState([32, 750]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortOption, setSortOption] = useState('Price (Low to High)');
  const [filteredRooms, setFilteredRooms] = useState([]);

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

  // Update search parameters (dates and room/guest count)
  const updateSearch = () => {
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
    
    console.log('Updating search with:', { checkInDate, checkOutDate, rooms, guests, ratePreference });
  };

  // Mock price slider functionality
  const handleMinPriceChange = (e) => {
    const newMin = parseInt(e.target.value);
    if (newMin < priceRange[1]) {
      setPriceRange([newMin, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (e) => {
    const newMax = parseInt(e.target.value);
    if (newMax > priceRange[0]) {
      setPriceRange([priceRange[0], newMax]);
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
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Check-in-Date</label>
            <div className="relative">
              <input 
                type="text" 
                value={checkInDate} 
                onChange={(e) => setCheckInDate(e.target.value)}
                className="border border-gray-300 p-2 w-full bg-gray-100 rounded"
                readOnly
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Check-out-Date</label>
            <div className="relative">
              <input 
                type="text" 
                value={checkOutDate} 
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="border border-gray-300 p-2 w-full bg-gray-100 rounded"
                readOnly
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
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
              <input 
                type="text" 
                value={ratePreference} 
                onChange={(e) => setRatePreference(e.target.value)}
                className="border border-gray-300 p-2 w-full bg-gray-100 rounded"
                readOnly
              />
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <button 
              onClick={updateSearch}
              className="bg-gray-800 text-white px-6 py-2 rounded font-medium"
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
              <h3 className="font-semibold mb-2">Price</h3>
              <div className="relative h-6 mb-2">
                <div className="absolute h-1 w-full bg-gray-200 top-1/2 transform -translate-y-1/2 rounded"></div>
                <div className="absolute h-1 bg-red-500" style={{ 
                  left: `${(priceRange[0] - 32) / (750 - 32) * 100}%`, 
                  right: `${100 - (priceRange[1] - 32) / (750 - 32) * 100}%`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}></div>
              </div>
              <div className="flex justify-between items-center">
                <input 
                  type="number" 
                  min="32" 
                  max={priceRange[1] - 1} 
                  value={priceRange[0]} 
                  onChange={handleMinPriceChange}
                  className="w-16 p-1 text-sm border rounded"
                />
                <span className="text-sm">to</span>
                <input 
                  type="number" 
                  min={priceRange[0] + 1} 
                  max="750" 
                  value={priceRange[1]} 
                  onChange={handleMaxPriceChange}
                  className="w-16 p-1 text-sm border rounded"
                />
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
                    <span className="text-gray-600">▶</span>
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
                    <span className="text-gray-600">▶</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Reset Filters Button */}
            <button 
              onClick={() => {
                setSelectedRoomTypes([]);
                setSelectedAmenities([]);
                setPriceRange([32, 750]);
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
                  <div key={room.id} className="border border-gray-300 rounded overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Room Image */}
                      <div className="w-full md:w-1/3 h-64 bg-gray-200 relative">
                        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">{room.type}</span>
                        </div>
                      </div>
                      
                      {/* Room Info */}
                      <div className="w-full md:w-2/3 p-6 flex flex-col">
                        <h3 className="text-xl font-bold mb-2">{room.type}</h3>
                        <p className="text-gray-600 mb-4">{room.description}</p>
                        
                        {/* Amenities */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          {room.amenities.map((amenity, idx) => (
                            <span key={idx} className="text-gray-700 text-sm">{amenity}</span>
                          ))}
                        </div>
                        
                        {/* Price and Book */}
                        <div className="mt-auto flex justify-between items-center">
                          <div className="text-right">
                            <span className="block text-xl font-bold">${room.price} / night</span>
                          </div>
                          <Link href={`/room/${room.id}`}>
                            <button className="bg-gray-800 text-white px-4 py-2 rounded">
                              Select Room
                            </button>
                          </Link>
                        </div>
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
                      setPriceRange([32, 750]);
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
