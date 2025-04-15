export default function OffersSection() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-4xl font-bold text-center mb-12">OFFERS</h2>
      
      <div className="grid grid-cols-1 gap-16">
        {/* First Row - Senior Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Image */}
          <div>
            <img 
              src="/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Senior's Discount.jpg" 
              alt="Happy senior couple enjoying drinks" 
              className="w-full h-auto object-cover rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Logo.jpg';
              }}
            />
          </div>
          
          {/* Right Side - Content */}
          <div>
            <h3 className="text-xl font-bold mb-4">BGH's Senior Discount</h3>
            <p className="text-gray-800 mb-6 text-center">
              Enjoy 5% off your stay—our way of honoring your timeless elegance and wisdom. Relax, unwind, and let us pamper you in true BGH style!
            </p>
          </div>
        </div>
        
        {/* Second Row - Group Booking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content */}
          <div>
            <h3 className="text-xl font-bold mb-4">BGH Group Booking Discounts</h3>
            <p className="text-gray-800 mb-4">The more, the merrier—and the bigger the savings!</p>
            
            <ul className="space-y-2 mb-6 list-none pl-0">
              <li>
                <span className="font-bold mr-2">•</span>
                <strong>5-10 guests:</strong> Enjoy 5% off your booking.
              </li>
              <li>
                <span className="font-bold mr-2">•</span>
                <strong>10-20 guests:</strong> Elevate your stay with a 15% discount.
              </li>
              <li>
                <span className="font-bold mr-2">•</span>
                <strong>20+ guests:</strong> Celebrate together with an exclusive 25% off!
              </li>
            </ul>
            
            <p className="text-gray-800">
              Bring your group and let BGH make your gathering unforgettable with luxury, comfort, and unbeatable value!
            </p>
          </div>
          
          {/* Right Side - Image */}
          <div>
            <img 
              src="/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Group Discount.jpg" 
              alt="Group enjoying vacation" 
              className="w-full h-auto object-cover rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Logo.jpg';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}