import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, Loader2 } from 'lucide-react'
import dateFormat from '../lib/dateFormat'
import timeFormat from '../lib/timeFormat'
import { createBooking } from '../lib/api'
import AuthModal from '../components/AuthModal'
import toast from 'react-hot-toast'

const BookingSummary = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const currency = import.meta.env.VITE_CURRENCY
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!state) {
    navigate('/')
    return null
  }

  const { movie, selectedSeats, selectedTime, showDate, showPrice } = state

  const totalAmount = selectedSeats.length * showPrice

  const handleConfirm = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast('Please login to confirm and save your booking to database!', { icon: '🔐' })
      setIsAuthModalOpen(true)
      return
    }

    setIsSubmitting(true)
    try {
      const apiRes = await createBooking({show:state.showId,seats:selectedSeats});
      if (!apiRes?.success || !apiRes.booking) throw new Error(apiRes?.message || 'Booking failed. Please retry.');
      toast.success('Seats reserved successfully');
      navigate('/booking-success',{state:apiRes.booking});
      window.scrollTo(0,0);
    } catch(e) { toast.error(e.message); }
    finally { setIsSubmitting(false); }
  }

  return (
    <div className='min-h-screen px-6 md:px-16 lg:px-40 pt-28 md:pt-36 pb-16'>
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition cursor-pointer'
      >
        <ArrowLeft className='w-4 h-4' />
        Back
      </button>

      <h1 className='text-2xl font-semibold mb-8'>Booking Summary</h1>

      <div className='flex flex-col lg:flex-row gap-8 max-w-4xl'>

        <div className='flex-1 bg-primary/8 border border-primary/20 rounded-xl p-6'>
          <div className='flex gap-5'>
            <img
              src={movie.poster_path}
              alt={movie.title}
              className='w-24 h-36 object-cover rounded-lg shrink-0'
            />
            <div className='flex flex-col gap-2'>
              <h2 className='text-xl font-semibold'>{movie.title}</h2>
              <p className='text-gray-400 text-sm'>{timeFormat(movie.runtime)}</p>
              <p className='text-gray-400 text-sm'>
                {movie.genres.slice(0, 2).map(g => g.name).join(' | ')}
              </p>
            </div>
          </div>

          <div className='mt-6 space-y-3 text-sm'>
            <div className='flex items-center gap-3'>
              <Calendar className='w-4 h-4 text-primary shrink-0' />
              <span className='text-gray-300'>
                {new Date(showDate).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <Clock className='w-4 h-4 text-primary shrink-0' />
              <span className='text-gray-300'>{selectedTime}</span>
            </div>
            <div className='flex items-center gap-3'>
              <MapPin className='w-4 h-4 text-primary shrink-0' />
              <span className='text-gray-300'>{state.theatre} · {state.screen}</span>
            </div>
            <div className='flex items-start gap-3'>
              <Ticket className='w-4 h-4 text-primary shrink-0 mt-0.5' />
              <div>
                <span className='text-gray-300'>Seats: </span>
                <span className='text-white font-medium'>{selectedSeats.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full lg:w-72 bg-primary/8 border border-primary/20 rounded-xl p-6 h-max'>
          <h3 className='text-lg font-semibold mb-5'>Price Details</h3>

          <div className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Ticket Price</span>
              <span>{currency}{showPrice}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Seats</span>
              <span>× {selectedSeats.length}</span>
            </div>
            <div className='border-t border-white/10 pt-3 flex justify-between font-semibold text-base'>
              <span>Total</span>
              <span className='text-primary'>{currency}{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className='w-full mt-6 py-3 bg-primary hover:bg-primary-dull disabled:opacity-50 rounded-lg font-medium transition cursor-pointer active:scale-95 flex items-center justify-center gap-2'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                Confirming Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>

          <p className='text-xs text-emerald-400 text-center mt-3'>
            Your seats will be reserved. No online payment is collected.
          </p>
        </div>

      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAuthModalOpen(false)
          handleConfirm()
        }}
      />
    </div>
  )
}

export default BookingSummary
