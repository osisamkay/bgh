export default function AmenitiesSection() {
  const amenities = [
    {
      icon: "🏊‍♂️",
      name: "Kids and Pool"
    },
    {
      icon: "🍳",
      name: "Free Breakfast"
    },
    {
      icon: "🧹",
      name: "Daily Housekeeping"
    },
    {
      icon: "💪",
      name: "Fully Housekeeping"
    },
    {
      icon: "🅿️",
      name: "Free parking"
    },
    {
      icon: "🐕",
      name: "Pets"
    },
    {
      icon: "🌳",
      name: "Garden View Tour"
    },
    {
      icon: "📶",
      name: "Wi-Fi"
    },
    {
      icon: "🍸",
      name: "Posh drinks"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <p className="text-gray-700 text-lg mb-12 max-w-4xl mx-auto text-center leading-relaxed">
        Welcome to Best Garden Hotel, Canada's premier destination for modern comfort and sophisticated style. Established in 2010, we've brought people together to enjoy modern elegance, timeless comfort, and world-class amenities amidst tranquil gardens—perfect for a memorable stay.
      </p>

      <div className="grid grid-cols-3 gap-x-16 gap-y-8 mb-8">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label={amenity.name}>
              {amenity.icon}
            </span>
            <span className="text-sm text-gray-700">{amenity.name}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="text-[#1a472a] font-medium flex items-center mx-auto hover:text-[#143521] transition-colors">
          Explore all amenities
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}