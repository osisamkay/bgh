import React from 'react';

export default function RoomsGuestsSelector({
  rooms,
  guests,
  showRoomGuestPicker,
  setShowRoomGuestPicker,
  handleRoomChange,
  handleGuestChange
}) {
  return (
    <div className="relative mb-4 md:mb-0 md:flex-1">
      <div 
        className="cursor-pointer"
        onClick={() => setShowRoomGuestPicker(!showRoomGuestPicker)}
      >
        <h2 className="text-xl font-bold">ROOMS & GUESTS</h2>
        <p className="text-gray-700">{rooms} room, {guests} guests</p>
      </div>
      
      {/* Rooms & Guests Picker Dropdown */}
      {showRoomGuestPicker && (
        <div className="absolute top-full left-0 mt-2 bg-white p-4 shadow-xl rounded-lg z-50 w-64 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Room & Guest Selection</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Rooms</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleRoomChange(Math.max(1, rooms - 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                  disabled={rooms <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-gray-800 w-8 text-center">{rooms}</span>
                <button 
                  onClick={() => handleRoomChange(Math.min(5, rooms + 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
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
                  onClick={() => handleGuestChange(Math.max(1, guests - 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                  disabled={guests <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-gray-800 w-8 text-center">{guests}</span>
                <button 
                  onClick={() => handleGuestChange(Math.min(8, guests + 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                  disabled={guests >= 8}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <button 
                onClick={() => setShowRoomGuestPicker(false)}
                className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors font-medium"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
