import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRight, Clock2Icon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import toast from 'react-hot-toast'
import { getMovieById } from '../lib/api'

// Default show price when not provided by backend
const DEFAULT_SHOW_PRICE = 200

// Some pre-booked seats to demonstrate unavailable seats
const SAMPLE_BOOKED_SEATS = ['A3', 'A4', 'B2', 'C5', 'D1', 'D2', 'E8', 'F3', 'G6']

const SeatLayout = () => {

  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedTimeRaw, setSelectedTimeRaw] = useState(null) // ISO string for passing to summary
  const [show, setShow] = useState(null)
  const navigate = useNavigate()

  // Rows grouped: first 2 rows together (A, B), then pairs (C-D, E-F, G-H, I-J)
  const groupRows = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J']]

  const getShow = async () => {
    const found = dummyShowsData.find((s) => s._id === id || String(s.id) === String(id))
    if (found) {
      setShow({
        movie: found,
        dateTime: dummyDateTimeData,
        showPrice: DEFAULT_SHOW_PRICE,
      })
      return
    }

    try {
      const apiMovie = await getMovieById(id)
      if (apiMovie) {
        setShow({
          movie: {
            _id: apiMovie._id,
            id: apiMovie._id,
            title: apiMovie.title,
            poster_path: apiMovie.poster || '',
            runtime: apiMovie.duration || 120,
            genres: Array.isArray(apiMovie.genre) ? apiMovie.genre.map((g) => ({ name: g })) : [],
          },
          dateTime: dummyDateTimeData,
          showPrice: DEFAULT_SHOW_PRICE,
        })
        return
      }
    } catch {
      // Fallback
    }

    // Default fallback to first movie if not matched
    if (dummyShowsData.length > 0) {
      setShow({
        movie: dummyShowsData[0],
        dateTime: dummyDateTimeData,
        showPrice: DEFAULT_SHOW_PRICE,
      })
    }
  }

  useEffect(() => {
    getShow()
  }, [])

  const isBooked = (seatId) => SAMPLE_BOOKED_SEATS.includes(seatId)

  const renderSeats = (row, count = 9) => (
    <div key={row} className='flex gap-2 mt-2'>
      <div className='flex flex-nowrap items-center justify-center gap-2'>
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`
          const booked = isBooked(seatId)
          const selected = selectedSeats.includes(seatId)
          return (
            <button
              key={seatId}
              disabled={booked}
              onClick={() => handleSeatClick(seatId)}
              title={booked ? 'Already booked' : seatId}
              className={`h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded text-xs border transition
                ${booked
                  ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                  : selected
                    ? 'bg-primary border-primary text-white cursor-pointer'
                    : 'border-primary/60 hover:border-primary cursor-pointer'
                }`}
            >
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast('Please select a show time first.')
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast('You can select up to 5 seats only.')
    }
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId))
    } else {
      setSelectedSeats([...selectedSeats, seatId])
    }
  }

  const handleProceed = () => {
    if (!selectedTime) {
      return toast('Please select a show time.')
    }
    if (selectedSeats.length === 0) {
      return toast('Please select at least one seat.')
    }
    navigate('/booking-summary', {
      state: {
        movie: show.movie,
        selectedSeats,
        selectedTime,
        showDate: date,
        showPrice: show.showPrice,
      },
    })
    scrollTo(0, 0)
  }

  const currency = import.meta.env.VITE_CURRENCY
  const totalAmount = selectedSeats.length * (show?.showPrice || 0)

  return show ? (
    <div className='flex flex-col xl:flex-row px-4 sm:px-6 md:px-16 lg:px-40 pt-24 md:pt-32 pb-10'>

      {/* Available timings */}
      <div className='w-full xl:w-60 bg-primary/10 border border-primary/20 rounded-lg py-6 xl:py-10 h-max'>
        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className='mt-5 space-y-1'>
          {show.dateTime[date]?.map((item) => (
            <div
              key={item.time}
              onClick={() => {
                setSelectedTime(isoTimeFormat(item.time))
                setSelectedTimeRaw(item.time)
                setSelectedSeats([]) // reset seats when time changes
              }}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition
                ${selectedTime === isoTimeFormat(item.time)
                  ? 'bg-primary text-white'
                  : 'hover:bg-primary/20'
                }`}
            >
              <Clock2Icon className='w-4 h-4' />
              <p>{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16 w-full min-w-0'>

        <h1 className='text-2xl font-semibold mb-4'>Select Your Seat</h1>

        {/* Seat Legend */}
        <div className='flex items-center gap-5 text-xs text-gray-400 mb-6'>
          <span className='flex items-center gap-1'>
            <span className='h-4 w-4 rounded border border-primary/60 inline-block' /> Available
          </span>
          <span className='flex items-center gap-1'>
            <span className='h-4 w-4 rounded bg-primary inline-block' /> Selected
          </span>
          <span className='flex items-center gap-1'>
            <span className='h-4 w-4 rounded bg-gray-700 inline-block' /> Booked
          </span>
        </div>

        {/* Screen + Seats scroll together */}
        <div className='w-full overflow-x-auto'>
          <div className='w-max min-w-full flex flex-col items-center'>
            <img src={assets.screenImage} alt='Screen' />
            <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

            <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
              {/* A & B — premium/front rows */}
              <div className='gap-2 mb-6'>
                {groupRows[0].map((row) => renderSeats(row))}
              </div>

              {/* C-J — side-by-side groups */}
              <div className='grid grid-cols-2 gap-11'>
                {groupRows.slice(1).map((group, idx) => (
                  <div key={idx}>
                    {group.map((row) => renderSeats(row))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selection summary */}
        {selectedSeats.length > 0 && (
          <div className='mt-8 w-full max-w-md bg-primary/10 border border-primary/20 rounded-lg px-5 py-4 text-sm'>
            <div className='flex justify-between mb-2'>
              <span className='text-gray-400'>Selected Seats</span>
              <span className='font-medium'>{selectedSeats.join(', ')}</span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-gray-400'>Price per seat</span>
              <span>{currency}{show.showPrice}</span>
            </div>
            <div className='flex justify-between font-semibold border-t border-white/10 pt-2 mt-1'>
              <span>Total</span>
              <span className='text-primary'>{currency}{totalAmount}</span>
            </div>
          </div>
        )}

        <div className='flex justify-center w-full mt-10 mb-4'>
          <button
            onClick={handleProceed}
            className='flex items-center justify-center gap-2 px-7 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium text-sm cursor-pointer active:scale-95'
          >
            <p>Proceed to Checkout</p>
            <ArrowRight strokeWidth={3} className='w-4 h-4' />
          </button>
        </div>

      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout
