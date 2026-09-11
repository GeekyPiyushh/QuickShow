import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'

const MovieDetails = () => {
  const {id} = useParams()
  const [show, setShow] = useState(null)
  const navigate = useNavigate()
  
  const getShow = async () => {
    const show = dummyShowsData.find((show) => show._id === id)

    if (show){
      setShow({
        movie: show,
        dateTime: dummyDateTimeData
      })
    }

  }
  useEffect(() => {
    getShow()
  }, [id])

  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img src={show.movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-104 max-w-75 object-cover'/>

        <div className='relative flex flex-col gap-3'>

          <p className='text-primary'>ENGLISH</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-primary fill-primary'/>
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>

          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
          <p>
            {timeFormat(show.movie.runtime)} • {show.movie.genres.map((genre) => genre.name).join(' | ')} • {show.movie.release_date.split("-")[0]}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>

            <button className='flex items-center gap-2 px-7 py-3 bg-gray-700 hover:bg-gray-800 cursor-pointer transition rounded-lg font-medium active:scale-95'>
              <PlayCircleIcon className='w-5 h-5'/>
              Watch Trailer
            </button>
            <a href="#dateselect" className='px-10 py-3 bg-primary hover:bg-primary-dull transition rounded-lg font-medium cursor-pointer active:scale-95'>Buy Tickets</a>
            <button className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className={`w-5 h-5`}/>
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
