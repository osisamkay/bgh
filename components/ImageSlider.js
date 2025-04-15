import { useState } from 'react'

export default function ImageSlider() {
  const [slideIndex, setSlideIndex] = useState(1);
  
  const images = [
    {
      url: '/images/pool.jpg',
      alt: 'Indoor Pool'
    },
    {
      url: '/images/entrance.jpg',
      alt: 'Hotel Entrance'
    },
    {
      url: '/images/restaurant.jpg',
      alt: 'Hotel Restaurant'
    }
  ];

  const changeSlide = (n) => {
    let newIndex = slideIndex + n;
    if (newIndex > images.length) newIndex = 1;
    if (newIndex < 1) newIndex = images.length;
    setSlideIndex(newIndex);
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-opacity duration-500 ${
            slideIndex === index + 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image.url})` }}
            role="img"
            aria-label={image.alt}
          />
        </div>
      ))}
      
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-colors"
        onClick={() => changeSlide(-1)}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-colors"
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/30 px-3 py-1 rounded-full">
        <span className="text-white text-sm">{slideIndex} / {images.length}</span>
      </div>
    </div>
  )
}