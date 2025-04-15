export default function BreakfastSection() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row overflow-hidden ">
        {/* Left side - Image */}
        <div className="md:w-1/2">
          <img 
            src="/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Homepage - Free Breakfast.jpg" 
            alt="Delicious breakfast pastries" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/breakfast.jpg';
            }}
          />
        </div>
        
        {/* Right side - Text content */}
        <div className="md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 tracking-wide">COMPLIMENTARY BREAKFAST & PARKING</h2>
          
          <div className="w-16 h-1 bg-gray-800 mb-6"></div>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Get your day started with our complimentary buffet breakfast, including a daily rotation of eggs, breakfast meats, breakfast breads and pastries, yogurts, hot oatmeal, fresh fruit, juices, coffee and more. Served Monday to Sunday from 6:30am-10:00am. All guests enjoy complimentary parking.
          </p>
          
          <a href="#" className="text-blue-700 font-medium text-lg hover:underline flex items-center mt-2">
            Learn more <span className="ml-1">&gt;</span>
          </a>
        </div>
      </div>
    </div>
  );
}