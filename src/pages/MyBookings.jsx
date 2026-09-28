import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import timeFormat from '../lib/timeFormat'
import dateFormat from '../lib/dateFormat'
import { Ticket } from 'lucide-react'

// When backend is connected:
// Replace localStorage.getItem('myBookings') with an API call:
//   const response = await axios.get('/api/bookings/my')
//   setBookings(response.data.bookings)

import { getMyBookings as fetchApiBookings } from '../lib/api'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBookings = async () => {
    const stored = JSON.parse(localStorage.getItem('myBookings') || '[]')
    try {
      const apiData = await fetchApiBookings()
      if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        // Format API bookings to match UI format
        const formattedApi = apiData.map((b) => ({
          _id: b.bookingId || b._id,
          show: {
            movie: {
              title: b.show?.movie?.title || 'Movie',
              poster_path: b.show?.movie?.poster || b.show?.movie?.poster_path || '',
              runtime: b.show?.movie?.duration || b.show?.movie?.runtime || 120,
            },
            showDateTime: b.show?.showDate || b.show?.showDateTime || b.createdAt,
          },
          bookedSeats: Array.isArray(b.seats) ? b.seats.map((s) => s.seatNumber || s) : (b.bookedSeats || []),
          amount: b.totalAmount ?? b.amount ?? 0,
        }))
        // Combine API and local bookings without duplicates
        const combined = [...formattedApi, ...stored.filter(s => !formattedApi.some(a => a._id === s._id))]
        setBookings(combined)
      } else {
        setBookings(stored)
      }
    } catch {
      setBookings(stored)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>

      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/5 text-center'>
          <Ticket className='w-12 h-12 text-gray-600 mb-4' strokeWidth={1.5} />
          <h2 className='text-xl font-semibold text-gray-300 mb-2'>No Bookings Yet</h2>
          <p className='text-sm text-gray-500 max-w-xs mb-6'>
            You haven't booked any tickets yet. Browse movies and book your seats!
          </p>
          <a
            href='/movies'
            className='px-6 py-2.5 bg-primary hover:bg-primary-dull rounded-full font-medium text-sm transition'
          >
            Browse Movies
          </a>
        </div>
      ) : (
        bookings.map((item, index) => (
          <div
            key={index}
            className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'
          >
            <div className='flex flex-col md:flex-row'>
              <img
                src={item.show.movie.poster_path}
                alt={item.show.movie.title}
                className='md:max-w-45 h-auto object-cover object-bottom rounded aspect-video'
              />
              <div className='flex flex-col p-4'>
                <p className='text-lg font-semibold'>{item.show.movie.title}</p>
                <p className='text-gray-400 text-sm'>{timeFormat(item.show.movie.runtime)}</p>
                <p className='text-gray-400 text-sm mt-auto'>{dateFormat(item.show.showDateTime)}</p>
              </div>
            </div>

            <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
              <div className='flex items-center gap-4'>
                <p className='text-xl font-semibold mb-3'>{currency}{item.amount}</p>
              </div>
              <div className='text-sm'>
                <p><span className='text-gray-400'>Booking ID:</span> {item._id}</p>
                <p><span className='text-gray-400'>Total Tickets:</span> {item.bookedSeats.length}</p>
                <p><span className='text-gray-400'>Seat Numbers:</span> {item.bookedSeats.join(', ')}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  ) : (
    <Loading />
  )
}

export default MyBookings
