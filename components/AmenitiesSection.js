import React from 'react';
import Image from 'next/image';

export default function AmenitiesSection() {
  const amenities = [
    {
      icon: (
        <Image src="/images/baby-bib-icon.svg" alt="Kids eat free" width={25} height={25} />
      ),
      name: "Kids eat free"
    },
    {
      icon: (
       <Image src="/images/breakfast-set-svgrepo-com.svg" alt="Free breakfast" width={25} height={25} />
      ),
      name: "Free breakfast"
    },
    {
      icon: (
       <Image src="/images/cleaning-spray-svgrepo-com.svg" alt="Daily housekeeping" width={25} height={25} />
      ),
      name: "Daily housekeeping"
    },
    {
      icon: (
       <Image src="/images/weightlifting-gym-svgrepo-com.svg" alt="Fitness center" width={25} height={25} />
      ),
      name: "Fitness center"
    },
    {
      icon: (
        <Image src="/images/parking-svgrepo-com.svg" alt="On-site parking" width={25} height={25} />
      ),
      name: "On-site parking"
    },
    {
      icon: (
       <Image src="/images/swim-svgrepo-com.svg" alt="Pool" width={25} height={25} />
      ),
      name: "Pool"
    },
    {
      icon: (
       <Image src="/images/no-smoking-svgrepo-com.svg" alt="Smoke-free hotel" width={25} height={25} />
      ),
      name: "Smoke-free hotel"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      name: "Wi-Fi"
    },
    
    {
      icon: (
        <Image src="/images/shuttle-svgrepo-com.svg" alt="Area shuttle" width={25} height={25} />
      ),
      name: "Area shuttle"
    }
  ];

  return (
    <section className="container mx-auto  px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">CANADA'S TOP DESTINATION FOR</h1>
        <h1 className="text-4xl font-bold mb-8">A BLEND OF ELEGANCE AND COMFORT</h1>
        
        <p className="text-base leading-relaxed  mx-auto mb-6">
          Welcome to Best Garden Hotel, Canada's premier destination where sophistication meets serenity! Since opening our first hotel in 2020, we've brought people together to enjoy modern elegance, timeless comfort, and world-class amenities amidst tranquil gardens—perfect for a memorable escape.
        </p>
        
        <p className="text-base leading-relaxed  mx-auto">
          As we expand across provinces, our commitment to exceptional guest experiences remains at the core of everything we do, starting with our new online reservation system designed just for you!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-10">
        {amenities.slice(0, 9).map((amenity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="text-gray-600">
              {amenity.icon}
            </div>
            <span className="text-gray-700 font-medium">{amenity.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a href="#" className="text-blue-700 font-medium hover:underline inline-flex items-center">
          Explore all amenities
          <span className="ml-1">&gt;</span>
        </a>
      </div>
    </section>
  );
}