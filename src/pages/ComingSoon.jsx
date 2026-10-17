import React, { useState } from 'react'
import { Search, Star, Bell, Play, Tag, Clock } from 'lucide-react'
import { dummyUpcomingData } from '../assets/assets'
import UpcomingCard from '../components/UpcomingCard'

const ComingSoon = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const heroMovie = dummyUpcomingData[0]
  const tallCardMovie = dummyUpcomingData[1]
  const gridMovies = dummyUpcomingData.slice(2, 6)

  // Filter grid movies based on search input
  const filteredGrid = gridMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pb-20">
      
      {/* 1. SEAMLESS HERO SECTION WITH INTEGRATED HEADING */}
      <div className="relative w-full min-h-[720px] flex flex-col justify-between px-6 md:px-16 lg:px-28 pt-28 pb-12 overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <img
            src={heroMovie.backdrop}
            alt={heroMovie.title}
            className="w-full h-full object-cover object-top opacity-75"
          />
        
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d1117]/50 to-[#0d1117]" />
        </div>

        {/* Hero Movie Content Area */}
        <div className="relative z-10 max-w-2xl flex flex-col gap-4 mt-8">
          
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-primary text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
              {heroMovie.rating || heroMovie.badge}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl tracking-tight text-white uppercase drop-shadow-md">
            {heroMovie.title}
          </h1>

          <div className="flex items-center flex-wrap gap-3 text-xs text-gray-300 font-medium">
            <div className="flex items-center gap-1 text-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-primary stroke-primary" />
              ))}
            </div>
            <span className="text-gray-500">|</span>
            <div className="flex items-center gap-1 text-gray-300">
              <Tag className="w-3 h-3 text-primary" />
              <span>{Array.isArray(heroMovie.genres) ? heroMovie.genres.join(' • ') : heroMovie.genres}</span>
            </div>
            <span className="text-gray-500">|</span>
            <div className="flex items-center gap-1 text-primary font-semibold">
              <Clock className="w-3 h-3 text-primary" />
              <span>{heroMovie.releaseDate}</span>
            </div>
          </div>

          <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed line-clamp-4 max-w-xl">
            {heroMovie.logline}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/40 text-xs font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer tracking-wider">
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>READ MORE</span>
            </button>
            <button className="flex items-center gap-2 bg-primary/90 hover:bg-primary-dull text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer shadow-lg tracking-wider">
              <Bell className="w-3.5 h-3.5" />
              <span>REMIND ME</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 text-center mt-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white  mb-2 drop-shadow-lg">
            Upcoming Releases
          </h2>
          <p className="mt-5 text-gray-400 font-normal">
            All Upcoming Launches.
          </p>
        </div>

      </div>

      {/* 2. ASYMMETRICAL MOVIE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 md:px-16 lg:px-28 my-12">
        
        <div className="lg:col-span-1">
          <UpcomingCard movie={tallCardMovie} isTall={true} />
        </div>

        
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredGrid.map((movie) => (
            <UpcomingCard key={movie._id} movie={movie} isTall={false} />
          ))}
        </div>
      </div>

      {/* 3. BOTTOM PILL SEARCH BAR */}
      <div className="flex flex-col items-center gap-3 max-w-md mx-auto text-center px-6">
        <p className="text-xs text-gray-400">
          Looking for something else? Search our upcoming releases:
        </p>
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try "The Lord of the Rings"'
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-6 pr-12 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition shadow-inner"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

    </div>
  )
}

export default ComingSoon