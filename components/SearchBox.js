import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// Import sub-components
import DateSelector from './search/DateSelector';
import RoomsGuestsSelector from './search/RoomsGuestsSelector';
import RateSelector from './search/RateSelector';
import SearchButton from './search/SearchButton';

// Import utility functions
import { formatDateForDisplay, formatDateForInput, calculateNights } from './search/DateUtils';

export default function SearchBox() {
  const router = useRouter();
  
  // State management
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
  
  // Dropdown visibility state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRoomGuestPicker, setShowRoomGuestPicker] = useState(false);
  const [showRatePicker, setShowRatePicker] = useState(false);

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
  const handleRoomChange = (value) => {
    setRooms(value);
  };

  // Handle guests change
  const handleGuestChange = (value) => {
    setGuests(value);
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
  
  // Close dropdowns when clicking outside
  const closeAllDropdowns = () => {
    setShowDatePicker(false);
    setShowRoomGuestPicker(false);
    setShowRatePicker(false);
  };

  // Handle clicks on each dropdown toggle
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    setShowRoomGuestPicker(false);
    setShowRatePicker(false);
  };

  const toggleRoomGuestPicker = () => {
    setShowRoomGuestPicker(!showRoomGuestPicker);
    setShowDatePicker(false);
    setShowRatePicker(false);
  };

  const toggleRatePicker = () => {
    setShowRatePicker(!showRatePicker);
    setShowDatePicker(false);
    setShowRoomGuestPicker(false);
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
    <div className="w-full bg-[#faf8e4] py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center">
            {/* Date Selector */}
            <div ref={datePickerRef}>
              <DateSelector
                nights={nights}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                showDatePicker={showDatePicker}
                setShowDatePicker={toggleDatePicker}
                handleCheckInChange={handleCheckInChange}
                handleCheckOutChange={handleCheckOutChange}
                formatDateForInput={formatDateForInput}
              />
            </div>
            
            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-16 bg-gray-300 mx-6"></div>
            
            {/* Rooms & Guests Selector */}
            <div ref={roomGuestPickerRef}>
              <RoomsGuestsSelector
                rooms={rooms}
                guests={guests}
                showRoomGuestPicker={showRoomGuestPicker}
                setShowRoomGuestPicker={toggleRoomGuestPicker}
                handleRoomChange={handleRoomChange}
                handleGuestChange={handleGuestChange}
              />
            </div>
            
            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-16 bg-gray-300 mx-6"></div>
            
            {/* Rate Selector */}
            <div ref={ratePickerRef}>
              <RateSelector
                ratePreference={ratePreference}
                showRatePicker={showRatePicker}
                setShowRatePicker={toggleRatePicker}
                handleRateChange={handleRateChange}
              />
            </div>
            
            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-16 bg-gray-300 mx-6"></div>
            
            {/* Search Button */}
            <div className="md:flex-1 flex items-center justify-center mt-4 md:mt-0">
              <SearchButton onClick={handleSearch} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
