import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData, dummyTrailers } from '../assets/assets'
import { Heart, PlayCircleIcon, StarIcon, X } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import ReactPlayer from 'react-player'
import toast from 'react-hot-toast'
import { getMovieById } from '../lib/api'

const MovieDetails = () => {
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [isFavourite, setIsFavourite] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const navigate = useNavigate()

  const checkIsFavourite = (movieId) => {
    try {
      const favs = JSON.parse(localStorage.getItem('favouriteMovies') || '[]')
      return favs.some((f) => (f._id || f.id) === movieId)
    } catch {
      return false
    }
  }

  const toggleFavourite = () => {
    if (!show?.movie) return
    const favs = JSON.parse(localStorage.getItem('favouriteMovies') || '[]')
    const movieId = show.movie._id || show.movie.id
    const exists = favs.some((f) => (f._id || f.id) === movieId)

    if (exists) {
      const updated = favs.filter((f) => (f._id || f.id) !== movieId)
      localStorage.setItem('favouriteMovies', JSON.stringify(updated))
      setIsFavourite(false)
      toast('Removed from Favourites')
    } else {
      favs.push(show.movie)
      localStorage.setItem('favouriteMovies', JSON.stringify(favs))
      setIsFavourite(true)
      toast.success('Added to Favourites!')
    }
  }

  const getShow = async () => {
    const localMovie = dummyShowsData.find((s) => s._id === id || String(s.id) === String(id))

    if (localMovie) {
      setShow({
        movie: localMovie,
        dateTime: dummyDateTimeData,
      })
      setIsFavourite(checkIsFavourite(localMovie._id || localMovie.id))
      return
    }

    try {
      const apiMovie = await getMovieById(id)
      if (apiMovie) {
        const norm = {
          _id: apiMovie._id,
          id: apiMovie._id,
          title: apiMovie.title,
          overview: apiMovie.description || '',
          poster_path: apiMovie.poster || '',
          runtime: apiMovie.duration || 120,
          genres: Array.isArray(apiMovie.genre)
            ? apiMovie.genre.map((g) => ({ name: g }))
            : [{ name: 'Action' }],
          release_date: apiMovie.releaseDate ? new Date(apiMovie.releaseDate).toISOString().split('T')[0] : '2025-01-01',
          vote_average: apiMovie.rating || 7.0,
          casts: dummyShowsData[0]?.casts || [],
        }
        setShow({
          movie: norm,
          dateTime: dummyDateTimeData,
        })
        setIsFavourite(checkIsFavourite(norm._id || norm.id))
      }
    } catch {
      if (dummyShowsData.length > 0) {
        setShow({
          movie: dummyShowsData[0],
          dateTime: dummyDateTimeData,
        })
        setIsFavourite(checkIsFavourite(dummyShowsData[0]._id))
      }
    }
  }

  useEffect(() => {
    getShow()
  }, [id])

  const trailerUrl = dummyTrailers[0]?.videoUrl || 'https://www.youtube.com/watch?v=WpW36ldAqnM'

  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      {/* Trailer Modal */}
      {showTrailer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md'>
          <div className='relative w-full max-w-4xl bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl'>
            <button
              onClick={() => setShowTrailer(false)}
              className='absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full transition cursor-pointer'
            >
              <X className='w-5 h-5' />
            </button>
            <div className='aspect-video w-full'>
              <ReactPlayer
                url={trailerUrl}
                playing={true}
                controls={true}
                width='100%'
                height='100%'
              />
            </div>
          </div>
        </div>
      )}

      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img src={show.movie.poster_path} alt='' className='max-md:mx-auto rounded-xl h-104 max-w-75 object-cover' />

        <div className='relative flex flex-col gap-3'>
          <p className='text-primary font-semibold tracking-wider text-xs uppercase'>Now Showing</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-primary fill-primary' />
            {Number(show.movie.vote_average).toFixed(1)} User Rating
          </div>

          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
          <p className='text-sm text-gray-300'>
            {timeFormat(show.movie.runtime)} • {show.movie.genres.map((genre) => genre.name).join(' | ')} • {show.movie.release_date?.split('-')[0]}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button
              onClick={() => setShowTrailer(true)}
              className='flex items-center gap-2 px-7 py-3 bg-gray-700 hover:bg-gray-800 cursor-pointer transition rounded-lg font-medium active:scale-95'
            >
              <PlayCircleIcon className='w-5 h-5' />
              Watch Trailer
            </button>

            <a
              href='#dateselect'
              className='px-10 py-3 bg-primary hover:bg-primary-dull transition rounded-lg font-medium cursor-pointer active:scale-95'
            >
              Buy Tickets
            </a>

            <button
              onClick={toggleFavourite}
              title={isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
              className={`p-3 rounded-full transition cursor-pointer active:scale-95 border ${
                isFavourite
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
                  : 'bg-gray-700 border-transparent text-gray-300 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavourite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <p className='text-lg font-medium mt-20'>
        Your Favourite cast
      </p>
      <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
        <div className='flex items-center gap-4 w-max px-4'>

          {show.movie.casts.slice(0,10).map((cast, index) => (
            <div key={index} className='flex flex-col items-center text-center'>
              <img src={cast.profile_path} alt="" className='rounded-full h-20 md:h-20 aspect-square object-cover'/>
              <p className='font-medium text-sm mt-3'>{cast.name}</p>
            </div>
          ))}
        </div>

      </div>

      <DateSelect dateTime={show.dateTime} id={id}/>

      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>

      <div className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 md:gap-8 mt-8 justify-center'>
        {dummyShowsData.slice(0,4).map((show) => (
            <MovieCard key={show._id} movie={show}/>
          ))}
      </div>

      <div className='flex justify-center mt-20'> 
          <button className='px-10 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer' onClick={() => {navigate('/movies'); scrollTo(0,0)}}>Show More</button>
      </div>

    </div>
  ) : 
  <div>
    <Loading />
  </div>
}

export default MovieDetails
