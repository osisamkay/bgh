import { useState, useEffect, useRef } from 'react';

export default function ImageSlider() {
  const [slideIndex, setSlideIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef(null);
  
  // Images from the directory listing that we confirmed exist
  const images = [
    {
      url: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Homepage - Swimming Pool.jpg',
      alt: 'Luxurious Indoor Swimming Pool',
      caption: 'Enjoy our spacious indoor swimming pool during your stay'
    },
    {
      url: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Homepage - Hotel Building.jpg',
      alt: 'Hotel Exterior View',
      caption: 'Best Garden Hotel - Your home away from home'
    },
    {
      url: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Homepage - Hotel Garden.jpg',
      alt: 'Peaceful Garden Setting',
      caption: 'Relax in our tranquil garden surroundings'
    },
    {
      url: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Homepage - Front Desk.jpg',
      alt: 'Welcoming Reception',
      caption: 'Our friendly staff are here to help 24/7'
    },
    {
      url: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Homepage - Hotel Lounge.webp',
      alt: 'Comfortable Hotel Lounge',
      caption: 'Unwind in our stylish hotel lounge area'
    },
    {
      url: '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Homepage - Complimentary Breakfast.jpg',
      alt: 'Complimentary Breakfast',
      caption: 'Start your day with our delicious complimentary breakfast'
    }
  ];

  // Function to get the previous slide index (circular)
  const getPrevIndex = (current) => {
    return current === 0 ? images.length - 1 : current - 1;
  };

  // Function to get the next slide index (circular)
  const getNextIndex = (current) => {
    return current === images.length - 1 ? 0 : current + 1;
  };

  const changeSlide = (direction) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (direction === 'prev') {
      setSlideIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setSlideIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
    
    // Reset transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
      {/* Slider container with padding for gaps */}
      <div className="relative w-full h-full" ref={sliderRef}>
        {/* Main visible slider with 3 images */}
        <div className="flex h-full">
          {/* Previous image (partly visible) */}
          <div className="absolute left-[-15%] w-[30%] h-full opacity-50 transition-all duration-500 ease-in-out z-10 hidden md:block p-[5px]">
            <div className="w-full h-full overflow-hidden ">
              <img
                src={images[getPrevIndex(slideIndex)].url}
                alt={images[getPrevIndex(slideIndex)].alt}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Logo.jpg';
                }}
              />
            </div>
          </div>
          
          {/* Current image (center) */}
          <div className="absolute left-0 md:left-[15%] w-full md:w-[70%] h-full transition-all duration-500 ease-in-out z-20 p-[5px]">
            <div className="w-full h-full overflow-hidden  relative">
              <img
                src={images[slideIndex].url}
                alt={images[slideIndex].alt}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Logo.jpg';
                }}
              />
              
              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 sm:p-4 transition-opacity">
                <h2 className="text-base sm:text-lg font-bold">{images[slideIndex].alt}</h2>
                <p className="text-xs sm:text-sm">{images[slideIndex].caption}</p>
              </div>
            </div>
          </div>
          
          {/* Next image (partly visible) */}
          <div className="absolute right-[-15%] w-[30%] h-full opacity-50 transition-all duration-500 ease-in-out z-10 hidden md:block p-[5px]">
            <div className="w-full h-full overflow-hidden ">
              <img
                src={images[getNextIndex(slideIndex)].url}
                alt={images[getNextIndex(slideIndex)].alt}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/BGH-images/BGH - Automated Hotel Reservation Photo Album/BGH Logo.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-30"
        onClick={() => changeSlide('prev')}
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-30"
        onClick={() => changeSlide('next')}
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Dots navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!isTransitioning) setSlideIndex(idx);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              slideIndex === idx ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </div>
  );
}