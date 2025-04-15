export default function RoomSection() {
  const rooms = [
    {
      type: 'Single',
      image: '/images/rooms/single.jpg',
      price: '$129'
    },
    {
      type: 'Twin',
      image: '/images/rooms/twin.jpg',
      price: '$159'
    },
    {
      type: 'Queen',
      image: '/images/rooms/queen.jpg',
      price: '$189'
    },
    {
      type: 'Deluxe',
      image: '/images/rooms/deluxe.jpg',
      price: '$249'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">ROOM & SUITES</h2>
      
      <div className="relative">
        <button className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-lg z-10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="grid grid-cols-4 gap-6">
          {rooms.map((room, index) => (
            <div key={index} className="group cursor-pointer">
              <div 
                className="h-64 bg-cover bg-center rounded-lg overflow-hidden"
                style={{ backgroundImage: `url('${room.image}')` }}
              >
                <div className="h-full bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium mb-2">{room.type}</h3>
                <button className="bg-[#1a472a] text-white px-6 py-2 rounded hover:bg-[#143521] transition-colors">
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}