import React from 'react';

export default function DateSelector({ 
  nights, 
  checkInDate, 
  checkOutDate, 
  showDatePicker, 
  setShowDatePicker, 
  handleCheckInChange, 
  handleCheckOutChange, 
  formatDateForInput
}) {
  return (
    <div className="relative mb-4 md:mb-0 md:flex-1">
      <div 
        className="cursor-pointer"
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        <h2 className="text-xl font-bold">{nights} {nights>1?'NIGHTS':'NIGHT'}</h2>
        <p className="text-gray-700">{checkInDate} - {checkOutDate}</p>
      </div>
      
      {/* Date Picker Dropdown */}
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
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
              <input 
                type="date" 
                value={formatDateForInput(checkOutDate)}
                onChange={handleCheckOutChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <button 
                onClick={() => setShowDatePicker(false)}
                className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors font-medium"
              >
                Apply Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
