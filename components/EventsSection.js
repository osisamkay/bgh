export default function EventsSection() {
  const eventSpaces = [
    {
      name: 'Party Hall',
      image: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH - Party hall (weddings, birthdays, reception).jpg',
      description: 'Perfect for celebrations and social gatherings'
    },
    {
      name: 'Conference Center',
      image: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Conference Center.jpg',
      description: 'Ideal for large corporate events and seminars'
    },
    {
      name: 'Meeting Room',
      image: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Meeting Room.jpg',
      description: 'Suitable for small business meetings and workshops'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">GROUP & EVENTS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {eventSpaces.map((space, index) => (
          <div key={index} className="group cursor-pointer">
            <div 
              className="h-64 bg-cover bg-center rounded-lg overflow-hidden mb-4"
              style={{ backgroundImage: `url('${space.image}')` }}
            >
              <div className="h-full bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2 w-9 mx-auto">{space.name}</h3>
             
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}