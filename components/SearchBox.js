import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

export default function SearchBox() {
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState('07/07/2025');
  const [checkOutDate, setCheckOutDate] = useState('07/17/2025');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [ratePreference, setRatePreference] = useState('Best Available ***');
  const [nights, setNights] = useState(9);
  
  // Refs for dropdown containers
  const datePickerRef = useRef(null);
  const roomGuestPickerRef = useRef(null);
  const ratePickerRef = useRef(null);
  
  // Modals visibility state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRoomGuestPicker, setShowRoomGuestPicker] = useState(false);
  const [showRatePicker, setShowRatePicker] = useState(false);

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    try {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateString;
    }
  };

  // Calculate number of nights between check-in and check-out dates
  const calculateNights = (checkIn, checkOut) => {
    try {
      const dateIn = new Date(formatDateForInput(checkIn).replace(/-/g, '/'));
      const dateOut = new Date(formatDateForInput(checkOut).replace(/-/g, '/'));
      const diffTime = Math.abs(dateOut - dateIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 0;
    } catch (e) {
      return 0;
    }
  };

  // Update check-in date and recalculate nights
  const handleCheckInChange = (e) => {
    const inputDate = e.target.value; // YYYY-MM-DD
    const formattedDate = formatDateForDisplay(inputDate);
    setCheckInDate(formattedDate);
    
    const updatedNights = calculateNights(formattedDate, checkOutDate);
    if (updatedNights > 0) {
      setNights(updatedNights);
    }
  };

  // Update check-out date and recalculate nights
  const handleCheckOutChange = (e) => {
    const inputDate = e.target.value; // YYYY-MM-DD
    const formattedDate = formatDateForDisplay(inputDate);
    setCheckOutDate(formattedDate);
    
    const updatedNights = calculateNights(checkInDate, formattedDate);
    if (updatedNights > 0) {
      setNights(updatedNights);
    }
  };

  // Handle rooms change
  const handleRoomChange = (e) => {
    setRooms(parseInt(e.target.value));
  };

  // Handle guests change
  const handleGuestChange = (e) => {
    setGuests(parseInt(e.target.value));
  };

  // Handle rate preference change
  const handleRateChange = (rate) => {
    setRatePreference(rate);
    setShowRatePicker(false);
  };

  // Handle search button click
  const handleSearch = () => {
    // Navigate to search page with query parameters
    router.push({
      pathname: '/search',
      query: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        rooms: rooms,
        guests: guests,
        rate: ratePreference
      }
    });
  };

  // Handle clicks outside the dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (roomGuestPickerRef.current && !roomGuestPickerRef.current.contains(event.target)) {
        setShowRoomGuestPicker(false);
      }
      if (ratePickerRef.current && !ratePickerRef.current.contains(event.target)) {
        setShowRatePicker(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto -mt-6 relative z-10">
      <div className="bg-[#faf8e4] rounded-lg shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Dates Section */}
          <div ref={datePickerRef} className="relative">
            <div 
              className="px-4 py-3 cursor-pointer hover:bg-[#f5f3dc] transition-all duration-200 rounded-md border border-transparent hover:border-gray-300"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowRoomGuestPicker(false);
                setShowRatePicker(false);
              }}
            >
              <div className="text-lg font-bold text-gray-800 mb-1">{nights} NIGHTS</div>
              <div className="text-gray-700 flex items-center">
                <span>{checkInDate} - {checkOutDate}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full left-0 mt-2 bg-white p-5 shadow-2xl rounded-lg z-50 w-80 border border-gray-200 transition-all duration-200 ease-in-out">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Your Dates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                    <input 
                      type="date" 
                      value={formatDateForInput(checkInDate)}
                      onChange={handleCheckInChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                    <input 
                      type="date" 
                      value={formatDateForInput(checkOutDate)}
                      onChange={handleCheckOutChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="pt-2">
                    <div className="text-sm text-gray-600 mb-2">
                      Stay duration: <span className="font-medium text-gray-800">{nights} nights</span>
                    </div>
                    <button 
                      onClick={() => setShowDatePicker(false)}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Apply Dates
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Rooms & Guests Section */}
          <div ref={roomGuestPickerRef} className="relative">
            <div 
              className="px-4 py-3 cursor-pointer hover:bg-[#f5f3dc] transition-all duration-200 rounded-md border border-transparent hover:border-gray-300"
              onClick={() => {
                setShowRoomGuestPicker(!showRoomGuestPicker);
                setShowDatePicker(false);
                setShowRatePicker(false);
              }}
            >
              <div className="text-lg font-bold text-gray-800 mb-1">ROOMS & GUESTS</div>
              <div className="text-gray-700 flex items-center">
                <span>{rooms} room, {guests} guests</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Rooms & Guests Picker Dropdown */}
            {showRoomGuestPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white p-5 shadow-2xl rounded-lg z-50 w-80 border border-gray-200 transition-all duration-200 ease-in-out">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Room & Guest Selection</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Rooms</label>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        disabled={rooms <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-gray-800 w-8 text-center">{rooms}</span>
                      <button 
                        onClick={() => setRooms(Math.min(5, rooms + 1))}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        disabled={rooms >= 5}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Guests</label>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        disabled={guests <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-gray-800 w-8 text-center">{guests}</span>
                      <button 
                        onClick={() => setGuests(Math.min(8, guests + 1))}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        disabled={guests >= 8}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => setShowRoomGuestPicker(false)}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Apply Selection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Rate Preference Section */}
          <div ref={ratePickerRef} className="relative">
            <div 
              className="px-4 py-3 cursor-pointer hover:bg-[#f5f3dc] transition-all duration-200 rounded-md border border-transparent hover:border-gray-300"
              onClick={() => {
                setShowRatePicker(!showRatePicker);
                setShowDatePicker(false);
                setShowRoomGuestPicker(false);
              }}
            >
              <div className="text-lg font-bold text-gray-800 mb-1">RATE PREFERENCE</div>
              <div className="text-gray-700 flex items-center">
                <span>{ratePreference}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Rate Picker Dropdown */}
            {showRatePicker && (
              <div className="absolute top-full left-0 mt-2 bg-white p-5 shadow-2xl rounded-lg z-50 w-80 border border-gray-200 transition-all duration-200 ease-in-out">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Rate Type</h3>
                <div className="space-y-2">
                  {['Best Available ***', 'Member Rate', 'Senior Discount', 'AAA/CAA Discount', 'Government & Military'].map(rate => (
                    <div 
                      key={rate} 
                      className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${
                        ratePreference === rate 
                          ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                          : 'hover:bg-gray-100 border border-transparent'
                      }`}
                      onClick={() => handleRateChange(rate)}
                    >
                      <div className="flex items-center">
                        {ratePreference === rate && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={ratePreference === rate ? 'font-medium' : ''}>{rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Search Button Section */}
          <div className="flex items-center justify-center">
            <button 
              onClick={handleSearch}
              className="bg-gray-900 text-white w-full py-5 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <span className="text-base">SEARCH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
