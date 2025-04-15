export default function LocationSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">LOCATION</h2>
      
      <div className="mb-12">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2800.4750990613366!2d-75.6971235!3d45.4215296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDI1JzE3LjUiTiA3NcKwNDEnNDkuNiJX!5e0!3m2!1sen!2sca!4v1625097453844!5m2!1sen!2sca"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          className="rounded-lg shadow-lg"
        ></iframe>
      </div>
      
      <div className="grid grid-cols-3 gap-8">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Contact</h3>
          <p className="text-gray-600 mb-1">Front Desk: 1-888-673-7987</p>
          <p className="text-gray-600">Email: info@bgh.ca</p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Address</h3>
          <p className="text-gray-600 mb-2">BGH Hall mall, Ottawa ON</p>
          <div className="space-y-1">
            <button className="text-[#1a472a] hover:text-[#143521] transition-colors block">
              Get directions
            </button>
            <button className="text-[#1a472a] hover:text-[#143521] transition-colors block">
              Parking and transportation
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Hours</h3>
          <p className="text-gray-600 mb-1">Check-in: 4:00 PM</p>
          <p className="text-gray-600 mb-1">Check-out: 11:00 AM</p>
          <p className="text-gray-600">Cancel by 6:00 PM hotel time</p>
        </div>
      </div>
    </div>
  )
}