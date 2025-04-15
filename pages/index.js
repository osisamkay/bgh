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
import SocialLinks from '../components/SocialLinks'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Best Garden Hotel</title>
        <meta name="description" content="Best Garden Hotel - A blend of elegance and comfort" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <ImageSlider />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <HotelInfo />
        <SearchBox />
        <AmenitiesSection />
        <RoomSection />
        <OffersSection />
        <EventsSection />
        <LocationSection />
        <BreakfastSection />
        <SocialLinks />
      </main>

      <Footer />
    </div>
  )
}