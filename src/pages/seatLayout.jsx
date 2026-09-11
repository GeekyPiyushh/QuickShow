import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRight, Clock2Icon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import toast from 'react-hot-toast'

const seatLayout = () => {

  const {id, date} = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const navigate = useNavigate()
  const groupRows = [["A" ,"B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

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
  }, [])

  const renderSeats = (row, count = 9) => (
    <div key={row} className='flex gap-2 mt-2'>
      <div className='flex flex-nowrap items-center justify-center gap-2'>
        {Array.from({length: count}, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return (
            <button key={seatId} onClick={() => handleSeatClick(seatId)} className={`h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded border border-primary/60 cursor-pointer ${selectedSeats.includes(seatId) && "bg-primary text-white"}`}>{seatId}</button>
          );
        })}
      </div>
    </div>
  )
  const handleSeatClick = (seatId) => {

    if (!selectedTime){
      return toast('Please select time first.')
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4){
      return toast('You can only select 5 seats.')
    }
    if (selectedSeats.includes(seatId)){
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    }
    else{
      setSelectedSeats([...selectedSeats, seatId]);
    }
  }

  return show ? (
    <div className='flex flex-col xl:flex-row px-4 sm:px-6 md:px-16 lg:px-40 pt-24 md:pt-32 pb-10'>
      {/* Available timings */}
       <div className='w-full xl:w-60 bg-primary/10 border border-primary/20 rounded-lg py-6 xl:py-10 h-max'>

        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className='mt-5 space-y-1'>

          {show.dateTime[date].map((item) => (
            <div onClick={() => setSelectedTime(isoTimeFormat(item.time))} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime === isoTimeFormat(item.time) ? "bg-primary text-white" : "hover:bg-primary/20"}`}>
              
              <Clock2Icon className='w-4 h-4'/>
              <p>{isoTimeFormat(item.time)}</p>

            </div>
          ))}
        </div>
       </div>

      {/* Seat Layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16 w-full min-w-0'>

        <h1 className='text-2xl font-semibold mb-4'>
          Select Your Seat
        </h1>

        {/* Screen + Seats should scroll together */}
        <div className='w-full overflow-x-auto'>
          
          <div className='w-max min-w-full flex flex-col items-center'>

            <img src={assets.screenImage} alt="" />

            <p className='text-gray-400 text-sm mb-6'>
              SCREEN SIDE
            </p>

            <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>

              {/* A & B */}
              <div className='gap-2 mb-6'>
                {groupRows[0].map((row) => renderSeats(row))}
              </div>

              {/* C-J */}
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
        <div className='flex justify-center w-full mt-15 mb-4'>
          <button
            onClick={() => navigate('/my-bookings')}
            className='flex items-center justify-center gap-2 px-7 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium text-sm cursor-pointer active:scale-95'
          >
            <p>Proceed to Checkout</p>
            <ArrowRight strokeWidth={3} className='w-4 h-4' />
          </button>
        </div>

</div>
    </div>
  ) : 
  <Loading />
}

export default seatLayout
