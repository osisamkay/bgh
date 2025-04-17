import React from 'react';
import Head from 'next/head'
import Header from '../components/Header'
import ImageSlider from '../components/ImageSlider'
import HotelInfo from '../components/HotelInfo'
import SearchBox from '../components/SearchBox'
import AmenitiesSection from '../components/AmenitiesSection'
import RoomSection from '../components/RoomSection'
import OffersSection from '../components/OffersSection'
import EventsSection from '../components/EventsSection'
import LocationSection from '../components/LocationSection'
import BreakfastSection from '../components/BreakfastSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Best Garden Hotel</title>
        <meta name="description" content="Best Garden Hotel - A blend of elegance and comfort" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      
      <ImageSlider />

      {/* Main Content */}
     
        <HotelInfo />
        <SearchBox />
        <AmenitiesSection />
        <RoomSection />
        <OffersSection />
        <EventsSection />
        <LocationSection />
        <BreakfastSection />
    

    
    </div>
  )
}