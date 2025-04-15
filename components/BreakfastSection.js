export default function BreakfastSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid grid-cols-2 gap-12 items-center">
        <div>
          <img 
            src="/images/breakfast.jpg" 
            alt="Delicious breakfast spread" 
            className="w-full h-[400px] object-cover rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">COMPLIMENTARY BREAKFAST & PARKING</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Start your day right with our complimentary daily breakfast, including a wide selection of eggs, breakfast meats, fresh breads and pastries, yogurt, hot cereal, fresh fruit, juices, and coffee. All served in our sunny breakfast area from 6:30am-10:00am (7:00am-10:30am on weekends). All guests enjoy complimentary parking.
          </p>
          <button className="text-[#1a472a] font-medium hover:text-[#143521] transition-colors flex items-center">
            Learn more
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}