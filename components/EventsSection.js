export default function EventsSection() {
  const eventSpaces = [
    {
      name: 'Party Hall',
      image: '/images/events/party-hall.jpg',
      description: 'Perfect for celebrations and social gatherings'
    },
    {
      name: 'Conference Center',
      image: '/images/events/conference-center.jpg',
      description: 'Ideal for large corporate events and seminars'
    },
    {
      name: 'Meeting Room',
      image: '/images/events/meeting-room.jpg',
      description: 'Suitable for small business meetings and workshops'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">GROUP & EVENTS</h2>
      
      <div className="grid grid-cols-3 gap-8">
        {eventSpaces.map((space, index) => (
          <div key={index} className="group cursor-pointer">
            <div 
              className="h-64 bg-cover bg-center rounded-lg overflow-hidden mb-4"
              style={{ backgroundImage: `url('${space.image}')` }}
            >
              <div className="h-full bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">{space.name}</h3>
              <p className="text-gray-600 mb-4">{space.description}</p>
              <button className="bg-[#1a472a] text-white px-6 py-2 rounded hover:bg-[#143521] transition-colors">
                Explore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}