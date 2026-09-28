import { ArrowRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyShowsData } from '../assets/assets'
import MovieCard from './MovieCard'
import { getMovies } from '../lib/api'

const normalizeMovie = (m) => ({
  _id: m._id,
  id: m.id || m._id,
  title: m.title,
  overview: m.description || m.overview || '',
  poster_path: m.poster || m.poster_path || '',
  backdrop_path: m.backdrop_path || m.poster || m.poster_path || '',
  genres: Array.isArray(m.genre)
    ? m.genre.map((g) => (typeof g === 'string' ? { id: g, name: g } : g))
    : (m.genres || []),
  languages: m.languages || [{ id: 1, name: m.language || 'English' }],
  casts: m.casts || [],
  release_date: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : (m.release_date || '2025-01-01'),
  vote_average: m.rating ?? m.vote_average ?? 7.0,
  runtime: m.duration || m.runtime || 120,
})

const FeaturedSection = () => {
  const navigate = useNavigate()
  const [movies, setMovies] = useState(dummyShowsData.slice(0, 4).map(normalizeMovie))

  useEffect(() => {
    async function load() {
      try {
        const live = await getMovies()
        if (live && Array.isArray(live) && live.length > 0) {
          setMovies(live.slice(0, 4).map(normalizeMovie))
        }
      } catch {
        // Fallback to dummy
      }
    }
    load()
  }, [])

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
        <button onClick={() => navigate('/movies')} className='flex group items-center gap-2 text-gray-300 cursor-pointer'>
          View All
          <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>    
        </button>
      </div>

      <div className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 md:gap-8 mt-8 justify-center'>
        {movies.map((show) => (
          <MovieCard key={show._id || show.id} movie={show} />
        ))}
      </div>

      <div className='flex justify-center'>
        <button onClick={() => {navigate('/movies'); scrollTo(0,0)}} className='px-10 py-3 bg-primary hover:bg-primary-dull cursor-pointer rounded-full transition font-medium mt-10 active:scale-95'>
          Show More
        </button>
      </div>
    </div>
  )
}

export default FeaturedSection
