import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Ticket, Printer, Home, CalendarCheck } from 'lucide-react'
import dateFormat from '../lib/dateFormat'

const BookingSuccess = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const currency = import.meta.env.VITE_CURRENCY

  if (!state) {
    navigate('/')
    return null
  }

  const booking = state
  const movie = booking.show?.movie || {}

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center'>

      <CheckCircle className='w-20 h-20 text-emerald-400 mb-4 animate-bounce' strokeWidth={1.5} />

      <h1 className='text-3xl font-bold mb-2 text-white'>Booking Confirmed!</h1>
      <p className='text-gray-400 mb-8 max-w-sm'>Your seats are reserved. Present this ticket at the cinema counter or on your mobile device.</p>

      {/* Printable Ticket Card */}
      <div id='ticket-print-area' className='w-full max-w-sm bg-gradient-to-b from-white/10 to-white/5 border border-primary/30 rounded-3xl p-6 text-left shadow-2xl backdrop-blur-md relative overflow-hidden'>
        
        {/* Top glowing bar */}
        <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-primary' />

        <div className='flex items-center justify-between text-primary mb-4 pt-1'>
          <div className='flex items-center gap-2'>
            <Ticket className='w-5 h-5' />
            <span className='font-bold text-xs tracking-wider uppercase'>SnapSeat E-Ticket</span>
          </div>
          <span className='text-xs font-mono text-gray-400'>{booking._id}</span>
        </div>

        <img
          src={movie.poster_path || movie.poster || movie.backdrop_path || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60'}
          alt={movie.title}
          className='w-full h-44 object-cover object-center rounded-xl mb-4 shadow-md'
        />

        <h2 className='text-xl font-bold text-white mb-1 truncate'>{movie.title}</h2>
        <p className='text-xs text-primary mb-4'>SnapSeat Grand Cinemas • Screen 1</p>

        <div className='border-t border-dashed border-white/20 pt-4 space-y-2.5 text-xs sm:text-sm text-gray-300'>
          <div className='flex justify-between'>
            <span className='text-gray-400'>Show Date</span>
            <span className='font-medium text-white'>{dateFormat(booking.show.showDateTime)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-400'>Reserved Seats</span>
            <span className='font-bold text-primary bg-primary/20 px-2 py-0.5 rounded'>
              {Array.isArray(booking.bookedSeats) ? booking.bookedSeats.join(', ') : booking.bookedSeats}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-400'>Status</span>
            <span className='text-emerald-400 font-semibold'>Paid & Confirmed</span>
          </div>
          <div className='flex justify-between border-t border-white/10 pt-2.5 font-semibold text-sm'>
            <span className='text-gray-300'>Total Paid</span>
            <span className='text-primary text-base font-bold'>{currency}{booking.amount}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex flex-wrap items-center justify-center gap-3 mt-8'>
        <button
          onClick={handlePrint}
          className='flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition cursor-pointer active:scale-95 border border-white/15'
        >
          <Printer className='w-4 h-4' />
          Print / Download Ticket
        </button>
        <button
          onClick={() => { navigate('/my-bookings'); scrollTo(0, 0) }}
          className='flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dull text-white rounded-full font-medium transition cursor-pointer active:scale-95 shadow-lg shadow-primary/25'
        >
          <CalendarCheck className='w-4 h-4' />
          My Bookings
        </button>
        <button
          onClick={() => { navigate('/'); scrollTo(0, 0) }}
          className='flex items-center gap-2 px-5 py-2.5 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white rounded-full font-medium transition cursor-pointer active:scale-95'
        >
          <Home className='w-4 h-4' />
          Home
        </button>
      </div>
    </div>
  )
}

export default BookingSuccess
