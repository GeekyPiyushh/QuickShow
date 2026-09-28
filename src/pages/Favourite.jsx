import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import { Heart, Trash2, Film } from 'lucide-react'
import toast from 'react-hot-toast'

const Favourite = () => {
  const [favourites, setFavourites] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadFavourites()
  }, [])

  const loadFavourites = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('favouriteMovies') || '[]')
      setFavourites(stored)
    } catch {
      setFavourites([])
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your favourite movies?')) {
      localStorage.setItem('favouriteMovies', JSON.stringify([]))
      setFavourites([])
      toast.success('Favourites cleared')
    }
  }

  return (
    <div className='relative pt-32 pb-24 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8'>
        <div>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 bg-primary/20 text-primary rounded-xl'>
              <Heart className='w-6 h-6 fill-primary' />
            </div>
            <h1 className='text-2xl font-bold text-white'>Your Favourites</h1>
          </div>
          <p className='text-xs text-gray-400 mt-1.5'>
            {favourites.length} {favourites.length === 1 ? 'movie' : 'movies'} saved to your watchlist
          </p>
        </div>

        {favourites.length > 0 && (
          <button
            onClick={handleClearAll}
            className='flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 rounded-xl transition border border-red-500/20 cursor-pointer active:scale-95'
          >
            <Trash2 className='w-3.5 h-3.5' />
            Clear All
          </button>
        )}
      </div>

      {favourites.length > 0 ? (
        <div className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 md:gap-8 justify-center'>
          {favourites.map((movie) => (
            <MovieCard key={movie._id || movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20 px-4 border border-dashed border-white/10 rounded-2xl bg-white/5 my-8 text-center max-w-lg mx-auto'>
          <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4'>
            <Film className='w-8 h-8' />
          </div>
          <h2 className='text-xl font-bold text-gray-200 mb-2'>No Favourites Yet</h2>
          <p className='text-xs sm:text-sm text-gray-400 max-w-sm mb-6'>
            Explore trending movies and click the heart icon on any movie page to save them here for later!
          </p>
          <button
            onClick={() => navigate('/movies')}
            className='bg-primary hover:bg-primary-dull text-white text-xs font-semibold px-6 py-2.5 rounded-full transition active:scale-95 shadow-lg shadow-primary/20 cursor-pointer'
          >
            Browse Movies
          </button>
        </div>
      )}
    </div>
  )
}

export default Favourite
