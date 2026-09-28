import React from 'react'
import HeroSection from '../components/HeroSection'
import FeaturedSection from '../components/FeaturedSection'
import { SearchIcon } from 'lucide-react'
import { useState } from 'react'
import CineNews from '../components/CineNews'
import { useNavigate } from 'react-router-dom'

const Home = () => {

  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`)
      scrollTo(0, 0)
    }
  }

  return (
    <div>
      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className='absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 w-[90%] max-w-md shadow-lg transition-colors focus-within:border-primary'
      >
        <SearchIcon className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mr-2 shrink-0'/>
        <input
          type="text" placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='text-sm md:text-base placeholder-gray-400 text-white bg-transparent outline-none w-full'
        />
      </form>
      <HeroSection/>
      <FeaturedSection/>
      <CineNews/>
    </div>
  )
}

export default Home
