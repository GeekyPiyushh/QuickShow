import { StarIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'

const MovieCard = ({movie}) => {

    const navigate = useNavigate()
  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:translate-y-1 transition duration-300 w-full max-w-[350px]'>

      <img 
        onClick={() => {navigate(`/movies/${movie._id || movie.id}`); scrollTo(0,0)}} 
        src={movie.backdrop_path || movie.poster_path || movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60'} 
        alt={movie.title}
        className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer hover:opacity-90 transition'
      />

      <p className='font-semibold mt-2 truncate text-white'>{movie.title}</p>

      <p className='text-sm text-gray-400 mt-2 truncate'>
        {(movie.release_date ? new Date(movie.release_date).getFullYear() : '2025')} • {
          Array.isArray(movie.genres) && movie.genres.length > 0
            ? movie.genres.slice(0, 2).map((g) => (typeof g === 'string' ? g : g.name)).join(" | ")
            : (Array.isArray(movie.genre) ? movie.genre.slice(0, 2).join(" | ") : 'Entertainment')
        } • {movie.runtime ? timeFormat(movie.runtime) : '2h'}
      </p>

      <div className='flex items-center justify-between mt-4 pb-3'>
        <button 
          className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer text-white shadow-sm active:scale-95' 
          onClick={() => {navigate(`/movies/${movie._id || movie.id}`); scrollTo(0,0)}}
        >
          Buy Tickets
        </button>
        <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
          <StarIcon className='w-4 h-4 fill-primary text-primary'/>
          {Number(movie.vote_average ?? movie.rating ?? 7.0).toFixed(1)}
        </p>
      </div>
    </div>
  )
}

export default MovieCard
