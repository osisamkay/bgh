import React from 'react';

export default function RateSelector({
  ratePreference,
  showRatePicker,
  setShowRatePicker,
  handleRateChange
}) {
  const rates = ['Best Available ***', 'Member Rate', 'Senior Discount', 'AAA/CAA Discount', 'Government & Military'];

  return (
    <div className="relative mb-4 md:mb-0 md:flex-1">
      <div 
        className="cursor-pointer"
        onClick={() => setShowRatePicker(!showRatePicker)}
      >
        <h2 className="text-xl font-bold">RATE PREFERENCE</h2>
        <p className="text-gray-700">{ratePreference}</p>
      </div>
      
      {/* Rate Picker Dropdown */}
      {showRatePicker && (
        <div className="absolute top-full left-0 mt-2 bg-white p-4 shadow-xl rounded-lg z-50 w-64 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Rate Type</h3>
          <div className="space-y-2">
            {rates.map(rate => (
              <div 
                key={rate} 
                className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${
                  ratePreference === rate 
                    ? 'bg-amber-50 border border-amber-200 text-amber-700' 
                    : 'hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => handleRateChange(rate)}
              >
                <div className="flex items-center">
                  {ratePreference === rate && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
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
  );
}
