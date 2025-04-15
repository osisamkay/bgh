import React from 'react';

export default function AmenitiesSection() {
  const amenities = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 482 511.97"><path fill-rule="nonzero" d="M313.55 0c26.76 0 51.17 6.26 72.82 17.39 22.96 11.8 42.7 29.06 58.75 50.11 24.69 32.35 36.01 90.24 36.83 149.59.91 65.55-10.97 133.69-31.73 171.13-20.78 37.45-51.32 68.82-88.13 90.6-35.58 21.04-76.99 33.15-121.06 33.15-44.11 0-85.55-12.13-121.15-33.21-36.8-21.8-67.36-53.23-88.14-90.78C9.92 348.55-1.96 277.9.27 210.58c2-60.42 15.39-118.85 43.17-151.09 16.15-18.73 35.17-33.96 56.89-44.31C120.77 5.43 143.55 0 168.51 0h20.16c.63 0 1.25.06 1.85.17 17.89 2.38 29.1 13.16 34.15 26.39 2.3 6.04 3.25 12.6 2.91 19.08-.33 6.49-1.96 12.9-4.81 18.62-6.32 12.65-18.41 22.15-35.68 22.54-17.42.83-30.56 3.27-38.64 9.14-7.04 5.11-10.53 13.86-10.1 28.04.3 9.7 3.67 18.83 9.36 25.28 4.81 5.47 11.4 8.91 19.18 8.83h.08v-.04l144.8.01c1.33-.08 2.65-.22 3.96-.4 10.12-1.42 17.01-5.99 21.21-12.14 4.43-6.49 6.19-14.94 5.8-23.59-.07-1.6-.23-3.29-.47-5.03-1.61-11.49-6.06-18.63-12.59-22.96-7.15-4.74-17.25-6.83-29.2-7.75-12.44-.03-24.01-3.53-32.63-10.79-8.12-6.85-13.37-16.74-14.04-29.85-1.1-21.54 7.89-33.17 21.2-39.48C286.58.58 300.7 0 313.55 0zm-78.46 311.79c-6.75-15.99-15.56-26.33-15.56-36.67 0-13.97 5.37-27.95 21.47-27.95 16.1 0 21.47 13.98 21.47 27.95 0 10.34-8.81 20.68-15.56 36.67 2.93.91 5.58 2.48 7.77 4.54 10.49-13.86 15.04-26.68 24-31.85 12.1-6.99 26.89-9.33 34.94 4.62 8.05 13.95-1.36 25.59-13.47 32.57-8.97 5.19-22.37 2.7-39.65 4.87.31 1.39.47 2.84.47 4.33 0 1.6-.19 3.15-.54 4.64 17.32 2.18 30.74-.32 39.72 4.87 12.11 6.99 21.52 18.63 13.47 32.57-8.05 13.95-22.84 11.62-34.94 4.63-9-5.2-13.55-18.11-24.14-32.04a19.818 19.818 0 0 1-7.75 4.45c6.77 16.15 15.68 26.54 15.68 36.94 0 13.98-5.37 27.95-21.47 27.95-16.1 0-21.47-13.97-21.47-27.95 0-10.4 8.9-20.79 15.68-36.94a19.96 19.96 0 0 1-7.76-4.44c-10.58 13.93-15.13 26.83-24.13 32.03-12.1 6.99-26.89 9.32-34.94-4.63-8.05-13.94 1.36-25.58 13.47-32.57 8.98-5.19 22.4-2.69 39.72-4.87a20.25 20.25 0 0 1-.54-4.64c0-1.49.17-2.94.47-4.33-17.28-2.17-30.68.32-39.65-4.87-12.11-6.98-21.52-18.62-13.47-32.57 8.05-13.95 22.84-11.61 34.94-4.62 8.96 5.17 13.51 17.99 24 31.85 2.18-2.06 4.84-3.63 7.77-4.54zM376.94 35.7c-18.74-9.63-39.98-15.05-63.39-15.05-10.58 0-22.03.38-29.75 4.05-5.98 2.84-10 8.58-9.43 19.81.35 6.87 2.89 11.87 6.79 15.16 4.71 3.97 11.67 5.88 19.5 5.88l.73.04c15.44 1.12 28.96 4.07 39.66 11.17 11.43 7.58 19.09 19.25 21.62 37.32.31 2.24.53 4.58.64 6.97.57 12.83-2.27 25.7-9.35 36.08-7.32 10.72-18.87 18.61-35.41 20.93-1.8.25-3.71.44-5.72.55-.44.06-.89.09-1.34.09H166.97v-.04c-14.25.12-26.16-6.03-34.75-15.77-8.79-9.97-13.99-23.82-14.43-38.35-.67-21.78 5.75-35.99 18.56-45.29 11.78-8.56 28.48-12 49.77-13h.36c8.63-.14 14.67-4.87 17.82-11.19 1.61-3.23 2.53-6.84 2.72-10.47.19-3.64-.34-7.33-1.63-10.69-2.5-6.57-8.17-11.94-17.31-13.25h-19.57c-21.78 0-41.59 4.71-59.31 13.16-19.11 9.11-35.89 22.57-50.19 39.15-24.45 28.37-36.32 82.05-38.18 138.26-2.12 64.03 8.79 130.51 28.9 166.84 18.96 34.26 46.91 62.99 80.64 82.96 32.48 19.24 70.33 30.3 110.66 30.3 40.3 0 78.12-11.04 110.58-30.24 33.68-19.93 61.63-48.63 80.62-82.87 19.11-34.44 30.02-98.55 29.16-160.88-.77-55.38-10.81-108.73-32.64-137.34-14.24-18.67-31.66-33.93-51.81-44.29z"/></svg>
      ),
      name: "Kids eat free"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      name: "Free breakfast"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      name: "Daily housekeeping"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      name: "Fitness center"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      name: "On-site parking"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
      name: "Pool"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
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