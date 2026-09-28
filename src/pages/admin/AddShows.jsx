import React, { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { CheckIcon, DeleteIcon, StarIcon } from 'lucide-react'
import { kConvertor } from '../../lib/kConvertor'
import { getMovies, getScreens, createShow } from '../../lib/api'
import toast from 'react-hot-toast'

const format12Hour = (timeStr) => {
  if (!timeStr) return '10:00 AM'
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`
}

const calculateEndTime = (timeStr, durationMinutes = 120) => {
  if (!timeStr) return '12:00 PM'
  const [hours, minutes] = timeStr.split(':')
  const totalMin = parseInt(hours, 10) * 60 + parseInt(minutes, 10) + durationMinutes
  const endHours = Math.floor(totalMin / 60) % 24
  const endMins = totalMin % 60
  const ampm = endHours >= 12 ? 'PM' : 'AM'
  const h12 = endHours % 12 || 12
  return `${String(h12).padStart(2, '0')}:${String(endMins).padStart(2, '0')} ${ampm}`
}

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [screens, setScreens] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [dateTimeSelection, setDateTimeSelection] = useState({})
  const [dateTimeInput, setDateTimeInput] = useState('')
  const [showPrice, setShowPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [moviesData, screensData] = await Promise.all([
        getMovies(),
        getScreens(),
      ])

      if (moviesData && Array.isArray(moviesData) && moviesData.length > 0) {
        setNowPlayingMovies(moviesData)
      } else {
        setNowPlayingMovies(dummyShowsData)
      }

      if (screensData && Array.isArray(screensData) && screensData.length > 0) {
        setScreens(screensData)
      }
    } catch {
      setNowPlayingMovies(dummyShowsData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return
    const [date, time] = dateTimeInput.split('T')
    if (!date || !time) return

    setDateTimeSelection((prev) => {
      const times = prev[date] || []
      if (!times.includes(time)) {
        return {
          ...prev,
          [date]: [...times, time],
        }
      }
      return prev
    })
  }

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time)
      if (filteredTimes.length === 0) {
        const updatedState = { ...prev }
        delete updatedState[date]
        return updatedState
      }
      return {
        ...prev,
        [date]: filteredTimes,
      }
    })
  }

  const handleSubmit = async () => {
    if (!selectedMovie) {
      return toast.error('Please select a movie.')
    }
    if (!showPrice || Number(showPrice) <= 0) {
      return toast.error('Please enter a valid show price.')
    }
    if (Object.keys(dateTimeSelection).length === 0) {
      return toast.error('Please select at least one show date and time.')
    }

    const currentScreen = screens.length > 0 ? screens[0] : null
    if (!currentScreen) {
      return toast.error('No active cinema screen found in database.')
    }

    const theatreId = currentScreen.theatre?._id || currentScreen.theatre
    const screenId = currentScreen._id

    // Find movie duration
    const movieObj = nowPlayingMovies.find((m) => (m._id || m.id) === selectedMovie)
    const duration = movieObj?.duration || movieObj?.runtime || 120

    setIsSubmitting(true)
    let createdCount = 0
    let errorMessage = ''

    try {
      for (const date of Object.keys(dateTimeSelection)) {
        for (const time of dateTimeSelection[date]) {
          const payload = {
            movie: selectedMovie,
            theatre: theatreId,
            screen: screenId,
            showDate: new Date(`${date}T00:00:00.000Z`),
            startTime: format12Hour(time),
            endTime: calculateEndTime(time, duration),
            price: Number(showPrice),
          }

          const res = await createShow(payload)
          if (res && res.success) {
            createdCount++
          } else {
            errorMessage = res?.message || 'Failed to create show'
          }
        }
      }

      if (createdCount > 0) {
        toast.success(`Successfully added ${createdCount} show(s)!`)
        // Reset form
        setSelectedMovie(null)
        setDateTimeSelection({})
        setShowPrice('')
        setDateTimeInput('')
      } else if (errorMessage) {
        toast.error(errorMessage)
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while adding shows.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <Title text1='Add' text2='Shows' />
      <p className='mt-10 text-lg font-medium'>Now Playing Movies</p>

      <div className='overflow-x-auto pb-4'>
        <div className='group flex flex-wrap gap-4 mt-4 w-max'>
          {nowPlayingMovies.map((movie) => {
            const movieId = movie._id || movie.id
            const poster = movie.poster || movie.poster_path
            const rating = movie.rating ?? movie.vote_average ?? 7.0
            const votes = movie.vote_count ?? 1200
            const isSelected = selectedMovie === movieId

            return (
              <div
                key={movieId}
                className='relative max-w-40 cursor-pointer hover:translate-y-1 transition duration-300'
                onClick={() => setSelectedMovie(movieId)}
              >
                <div className='relative rounded-lg overflow-hidden'>
                  <img
                    src={poster}
                    alt={movie.title}
                    className='w-full h-56 object-cover brightness-90'
                  />
                  <div className='text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0'>
                    <p className='flex items-center gap-1 text-gray-400'>
                      <StarIcon className='w-4 h-4 fill-primary text-primary' />
                      {Number(rating).toFixed(1)}
                    </p>
                    <p className='text-gray-300 text-xs'>{kConvertor(votes)} Votes</p>
                  </div>
                </div>

                {isSelected && (
                  <div className='absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded'>
                    <CheckIcon className='w-4 h-4 text-white' strokeWidth={2.5} />
                  </div>
                )}
                <p className='font-medium truncate mt-2 text-sm'>{movie.title}</p>
                <p className='text-gray-400 text-xs'>
                  {movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : (movie.release_date || '')}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Show price input */}
      <div className='mt-8'>
        <label className='block text-sm font-medium mb-2'>Show Price</label>
        <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
          <p className='text-gray-400 text-sm'>{currency}</p>
          <input
            min={0}
            type='number'
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder='Enter show price'
            className='outline-none bg-transparent'
          />
        </div>
      </div>

      {/* Date & Time selection */}
      <div className='mt-6'>
        <label className='block text-sm font-medium mb-2'>Select Date and Time</label>
        <div className='inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg'>
          <input
            type='datetime-local'
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className='outline-none bg-transparent'
          />
          <button
            type='button'
            className='bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer'
            onClick={handleDateTimeAdd}
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Display selected Times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className='mt-6'>
          <h2 className='mb-2 text-sm font-medium'>Selected Date-Time</h2>
          <ul className='space-y-3'>
            {Object.keys(dateTimeSelection).map((date) => (
              <li key={date}>
                <div className='font-medium text-sm'>{date}</div>
                <div className='flex flex-wrap gap-2 mt-1 text-sm'>
                  {dateTimeSelection[date].map((time) => (
                    <div
                      key={time}
                      className='border border-primary px-2 py-1 flex items-center rounded text-xs'
                    >
                      <span>{format12Hour(time)}</span>
                      <DeleteIcon
                        className='ml-2 text-red-500 hover:text-red-700 cursor-pointer'
                        onClick={() => handleRemoveTime(date, time)}
                        width={14}
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(dateTimeSelection).length > 0 && (
        <button
          disabled={isSubmitting}
          onClick={handleSubmit}
          className='bg-primary text-white px-8 py-2.5 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50'
        >
          {isSubmitting ? 'Adding Show...' : 'Add Show'}
        </button>
      )}
    </>
  )
}

export default AddShows
