import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import dateFormat from '../../lib/dateFormat'
import { getAllBookings, login } from '../../lib/api'
import toast from 'react-hot-toast'

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const fetchBookings = async () => {
    setIsLoading(true)
    setIsUnauthorized(false)
    setErrorMessage(null)

    try {
      const res = await getAllBookings()
      if (!res) {
        setErrorMessage('Could not connect to backend server.')
        return
      }

      if (res.status === 401 || res.status === 403 || res.message === 'Admin access required' || res.message === 'Not authenticated') {
        setIsUnauthorized(true)
        return
      }

      if (res.success && Array.isArray(res.bookings)) {
        setBookings(res.bookings)
      } else {
        setErrorMessage(res.message || 'Failed to load bookings.')
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while fetching bookings.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setIsLoggingIn(true)
    try {
      const res = await login('admin@example.com', 'admin123')
      if (res && res.success) {
        toast.success('Admin authenticated successfully!')
        await fetchBookings()
      } else {
        toast.error(res?.message || 'Login failed.')
      }
    } catch {
      toast.error('Could not reach backend.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    window.addEventListener('auth-change', fetchBookings)
    return () => window.removeEventListener('auth-change', fetchBookings)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <Title text1='List' text2='Bookings' />

      {isUnauthorized ? (
        <div className='mt-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl max-w-xl text-center'>
          <p className='text-amber-400 font-medium mb-1'>Administrator Access Required</p>
          <p className='text-gray-400 text-xs mb-4'>
            Viewing customer bookings requires administrator authentication (401/403 Protected API).
          </p>
          <button
            disabled={isLoggingIn}
            onClick={handleQuickLogin}
            className='px-5 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50'
          >
            {isLoggingIn ? 'Logging in...' : 'Login as Admin'}
          </button>
        </div>
      ) : errorMessage ? (
        <div className='mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-w-2xl text-sm'>
          <p className='text-red-400 font-medium mb-1'>Failed to load bookings</p>
          <p className='text-gray-400 text-xs mb-3'>{errorMessage}</p>
          <button
            onClick={fetchBookings}
            className='px-4 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs transition cursor-pointer'
          >
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className='mt-10 py-16 border border-dashed border-white/10 rounded-xl bg-white/5 text-center max-w-3xl'>
          <p className='text-lg font-medium text-gray-300 mb-1'>No Bookings Found</p>
          <p className='text-sm text-gray-500'>No tickets have been booked in the system yet.</p>
        </div>
      ) : (
        <div className='max-w-4xl mt-6 overflow-x-auto'>
          <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
            <thead>
              <tr className='bg-primary/20 text-left text-white'>
                <th className='p-2 font-medium pl-5'>User Name</th>
                <th className='p-2 font-medium'>Movie Name</th>
                <th className='p-2 font-medium'>Show Time</th>
                <th className='p-2 font-medium'>Seats</th>
                <th className='p-2 font-medium'>Amount</th>
              </tr>
            </thead>

            <tbody className='text-sm font-light'>
              {bookings.map((item, index) => {
                const userName = item.user?.name || item.user?.email || 'Customer'
                const movieTitle = item.show?.movie?.title || 'Movie'
                const showDateStr = item.show?.showDate || item.show?.showDateTime
                const formattedDate = showDateStr ? dateFormat(showDateStr) : '-'
                const timeStr = item.show?.startTime ? ` (${item.show.startTime})` : ''
                const seatsStr = Array.isArray(item.seats) && item.seats.length > 0
                  ? item.seats.map((s) => s.seatNumber || s).join(', ')
                  : Array.isArray(item.bookedSeats)
                  ? item.bookedSeats.join(', ')
                  : '-'
                const amount = item.totalAmount ?? item.amount ?? 0

                return (
                  <tr
                    key={item._id || index}
                    className='border-b border-primary/20 bg-primary/60 even:bg-primary/10'
                  >
                    <td className='p-2 min-w-45 pl-5 font-medium'>{userName}</td>
                    <td className='p-2'>{movieTitle}</td>
                    <td className='p-2 text-gray-300'>{formattedDate}{timeStr}</td>
                    <td className='p-2'>{seatsStr}</td>
                    <td className='p-2 font-medium text-primary'>{currency} {amount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default ListBookings
