export default function OffersSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">OFFERS</h2>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Senior Discount Offer */}
        <div className="flex bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="w-1/2">
            <img 
              src="/images/offers/seniors.jpg" 
              alt="Happy senior couple enjoying drinks" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-1/2 p-8">
            <h3 className="text-xl font-bold mb-4">BGH's Senior Discount</h3>
            <p className="text-gray-600 mb-6">
              Enjoy 15% off your stay, our way of showing respect for your timeless elegance and wisdom. BGH seniors get an extra 5% off when you book through our website.
            </p>
            <button className="text-[#1a472a] font-medium hover:text-[#143521] transition-colors">
              Learn more →
            </button>
          </div>
        </div>

        {/* Group Booking Offer */}
        <div className="flex bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="w-1/2">
            <img 
              src="/images/offers/group.jpg" 
              alt="Happy group on beach" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-1/2 p-8">
            <h3 className="text-xl font-bold mb-4">BGH Group Booking Discounts</h3>
            <p className="text-gray-600 mb-4">
              The more, the merrier—and the bigger the savings!
            </p>
            <ul className="text-gray-600 space-y-2 mb-6">
              <li>• 5-10 people: 5% off booking</li>
              <li>• 11-20 people: 15% discount</li>
              <li>• 21+ people: 25% discount</li>
            </ul>
            <button className="text-[#1a472a] font-medium hover:text-[#143521] transition-colors">
              Learn more →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}