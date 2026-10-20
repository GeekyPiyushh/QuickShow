import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import { Heart, PlayCircleIcon, StarIcon, X, Film, Sparkles } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'
import { getMovieById } from '../lib/api'

const MOVIE_TRAILERS = {
  'gladiator ii': 'https://www.youtube.com/watch?v=4rgYUipGJNo',
  'dune: part two': 'https://www.youtube.com/watch?v=Way9Dexny3w',
  'interstellar': 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  'in the lost lands': 'https://www.youtube.com/watch?v=WpW36ldAqnM',
  'deadpool & wolverine': 'https://www.youtube.com/watch?v=73_1biulkYk',
  'oppenheimer': 'https://www.youtube.com/watch?v=uYPbbksJxIg',
  'spider-man: across the spider-verse': 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
  'until dawn': 'https://www.youtube.com/watch?v=-sAOWhvheK8',
  'lilo & stitch': 'https://www.youtube.com/watch?v=1pHDWnXmK7Y',
  'havoc': 'https://www.youtube.com/watch?v=umiKiW4En9g',
  'a minecraft movie': 'https://www.youtube.com/watch?v=wJO_vIDZn-I',
  'mission: impossible': 'https://www.youtube.com/watch?v=NOhDyHN4jqc',
  'thunderbolts': 'https://www.youtube.com/watch?v=v-b_XQh4VpA',
  'jawan': 'https://www.youtube.com/watch?v=MWOlnZSnXWE',
  'wandering earth': 'https://www.youtube.com/watch?v=VlWf8a2t9G4',
  'parasite': 'https://www.youtube.com/watch?v=5xH0RZE7Z4Q',
}

const getYouTubeEmbedUrl = (url, autoplay = false) => {
  if (!url) return 'https://www.youtube-nocookie.com/embed/4rgYUipGJNo'
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = (match && match[2].length === 11) ? match[2] : null
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`
  }
  return url
}

const resolveTrailer = (movie) => {
  if (movie?.trailer) return movie.trailer
  if (movie?.trailerUrl) return movie.trailerUrl
  const normalizedTitle = (movie?.title || '').toLowerCase().trim()
  for (const [key, url] of Object.entries(MOVIE_TRAILERS)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return url
    }
  }
  return 'https://www.youtube.com/watch?v=4rgYUipGJNo'
}

const MovieDetails = () => {
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [isFavourite, setIsFavourite] = useState(false)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
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
    try {
      const apiMovie = await getMovieById(id)
      if (apiMovie) {
        const norm = {
          _id: apiMovie._id || apiMovie.id,
          id: apiMovie.id || apiMovie._id,
          title: apiMovie.title,
          overview: apiMovie.overview || apiMovie.description || '',
          poster_path: apiMovie.poster_path || apiMovie.poster || '',
          backdrop_path: apiMovie.backdrop_path || apiMovie.poster_path || apiMovie.poster || '',
          trailer: resolveTrailer(apiMovie),
          runtime: apiMovie.runtime || apiMovie.duration || 120,
          genres: Array.isArray(apiMovie.genres) && apiMovie.genres.length > 0
            ? apiMovie.genres.map((g) => (typeof g === 'string' ? { name: g } : g))
            : (Array.isArray(apiMovie.genre)
                ? apiMovie.genre.map((g) => ({ name: g }))
                : [{ name: 'Action' }]),
          release_date: apiMovie.release_date || (apiMovie.releaseDate ? new Date(apiMovie.releaseDate).toISOString().split('T')[0] : '2025-01-01'),
          vote_average: apiMovie.vote_average ?? apiMovie.rating ?? 7.0,
          casts: (apiMovie.casts && apiMovie.casts.length > 0) ? apiMovie.casts : (dummyShowsData[0]?.casts || []),
        }
        setShow({
          movie: norm,
          dateTime: dummyDateTimeData,
        })
        setIsFavourite(checkIsFavourite(norm._id || norm.id))
        return
      }
    } catch {
    }

    if (dummyShowsData.length > 0) {
      const fallback = dummyShowsData.find((s) => String(s._id) === String(id) || String(s.id) === String(id)) || dummyShowsData[0]
      setShow({
        movie: {
          ...fallback,
          trailer: resolveTrailer(fallback),
        },
        dateTime: dummyDateTimeData,
      })
      setIsFavourite(checkIsFavourite(fallback._id || fallback.id))
    }
  }

  useEffect(() => {
    getShow()
  }, [id])

  const trailerUrl = show ? resolveTrailer(show.movie) : ''

  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-48 pb-20 text-white'>
      {showTrailerModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md'>
          <div className='relative w-full max-w-4xl bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl'>
            <button
              onClick={() => setShowTrailerModal(false)}
              className='absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full transition cursor-pointer'
              title='Close'
            >
              <X className='w-5 h-5' />
            </button>
            <div className='aspect-video w-full'>
              <iframe
                src={getYouTubeEmbedUrl(trailerUrl, true)}
                title={`${show.movie.title} Trailer`}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                className='w-full h-full border-0'
              />
            </div>
          </div>
        </div>
      )}

      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img
          src={show.movie.poster_path}
          alt={show.movie.title}
          className='max-md:mx-auto rounded-2xl h-104 max-w-75 object-cover shadow-2xl border border-white/10'
        />

        <div className='relative flex flex-col justify-center gap-3'>
          <p className='text-primary font-semibold tracking-wider text-xs uppercase'>Now Showing</p>
          <h1 className='text-4xl md:text-5xl font-bold tracking-tight text-balance'>{show.movie.title}</h1>
          <div className='flex items-center gap-2 text-gray-300 font-medium'>
            <StarIcon className='w-5 h-5 text-primary fill-primary' />
            <span>{Number(show.movie.vote_average).toFixed(1)} User Rating</span>
          </div>

          <p className='text-gray-300 mt-2 text-sm leading-relaxed max-w-xl'>{show.movie.overview}</p>
          <p className='text-sm text-gray-400'>
            {timeFormat(show.movie.runtime)} • {(show.movie.genres || []).map((genre) => (typeof genre === 'string' ? genre : genre.name)).join(' | ')} • {show.movie.release_date?.split('-')[0] || '2025'}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button
              onClick={() => {
                const el = document.getElementById('trailer-section')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' })
                } else {
                  setShowTrailerModal(true)
                }
              }}
              className='flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-white/10 cursor-pointer transition rounded-xl font-medium active:scale-95 shadow-md'
            >
              <PlayCircleIcon className='w-5 h-5 text-primary' />
              Watch Trailer
            </button>

            <a
              href='#dateselect'
              className='px-10 py-3 bg-primary hover:bg-primary-dull transition rounded-xl font-semibold cursor-pointer active:scale-95 shadow-lg shadow-primary/30'
            >
              Buy Tickets
            </a>

            <button
              onClick={toggleFavourite}
              title={isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
              className={`p-3 rounded-full transition cursor-pointer active:scale-95 border ${
                isFavourite
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-sm'
                  : 'bg-gray-800 border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavourite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className='mt-20'>
        <p className='text-xl font-bold tracking-tight mb-6'>Top Cast</p>
        <div className='overflow-x-auto no-scrollbar pb-4'>
          <div className='flex items-center gap-5 w-max px-2'>
            {(show.movie.casts || []).slice(0, 10).map((cast, index) => (
              <div key={index} className='flex flex-col items-center text-center group'>
                <div className='rounded-full p-1 border border-white/10 group-hover:border-primary/50 transition'>
                  <img src={cast.profile_path} alt={cast.name} className='rounded-full h-20 w-20 aspect-square object-cover' />
                </div>
                <p className='font-medium text-xs sm:text-sm mt-3 text-gray-300 max-w-[90px] truncate'>{cast.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id='trailer-section' className='mt-20 scroll-mt-24'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary shadow-md shadow-primary/20'>
              <Film className='w-5 h-5' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-xl md:text-2xl font-bold tracking-tight text-white'>Official Trailer</h2>
                <span className='text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1'>
                  <Sparkles className='w-3 h-3 text-primary' /> HD Embed
                </span>
              </div>
              <p className='text-xs text-gray-400'>Watch the official preview for {show.movie.title}</p>
            </div>
          </div>

          <button
            onClick={() => setShowTrailerModal(true)}
            className='hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer active:scale-95'
          >
            <PlayCircleIcon className='w-4 h-4 text-primary' />
            Cinema Mode
          </button>
        </div>

        <div className='relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-black/80 backdrop-blur-xl group ring-1 ring-white/10'>
          <div className='aspect-video w-full'>
            <iframe
              src={getYouTubeEmbedUrl(trailerUrl, false)}
              title={`${show.movie.title} Official Trailer`}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
              className='w-full h-full border-0'
            />
          </div>
        </div>
      </div>

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className='text-xl font-bold tracking-tight mt-20 mb-8'>You May Also Like</p>

      <div className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 md:gap-8 mt-8 justify-center'>
        {dummyShowsData.slice(0, 4).map((item) => (
          <MovieCard key={item._id} movie={item} />
        ))}
      </div>

      <div className='flex justify-center mt-20'>
        <button
          className='px-10 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-semibold cursor-pointer shadow-lg shadow-primary/30 active:scale-95'
          onClick={() => {
            navigate('/movies')
            scrollTo(0, 0)
          }}
        >
          Show More
        </button>
      </div>
    </div>
  ) : (
    <div>
      <Loading />
    </div>
  )
}

export default MovieDetails
