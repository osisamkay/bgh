export default function LocationSection() {
  return (
    <div className="container mx-auto px-4 py-16">
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
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-gray-600 mb-1">Front Desk: 1-888-673-7987</p>
          <p className="text-gray-600">Email: info@bgh.ca</p>
        </div>
         <div className="border-t-2 md:border-l-2 border-black"></div>
        <div>
          <p className="text-gray-600 mb-2">666 Hell Road, Ontario N1L 3H7</p>
          <div className="space-y-1">
            <button className="text-[#1a472a] hover:text-[#143521] transition-colors block">
              Parking and transportation details
            </button>
          </div>
        </div>
        <div className="border-t-2 md:border-l-2 border-black"></div>
        <div>
          <p className="text-gray-600 mb-1">Check-in: 4:00 PM</p>
          <p className="text-gray-600 mb-1">Check-out: 11:00 AM</p>
          <p className="text-gray-600">Minimum check-in age:18</p>
        </div>
      </div>
    </div>
  )
}