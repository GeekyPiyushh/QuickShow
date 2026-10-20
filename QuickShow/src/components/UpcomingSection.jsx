import { ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dummyUpcomingData } from '../assets/assets'
import UpcomingCard from './UpcomingCard'

const UpcomingSection = () => {
  const navigate = useNavigate()
  const previewMovies = dummyUpcomingData.slice(1, 5)

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden pt-12 pb-6'>
      <div className='relative flex items-center justify-between pb-8'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <span className='flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full'>
              <Sparkles className='w-3 h-3' /> Coming Soon
            </span>
          </div>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-white'>
            Upcoming Releases
          </h2>
        </div>

        <button
          onClick={() => {
            navigate('/upcoming')
            window.scrollTo(0, 0)
          }}
          className='flex group items-center gap-1.5 text-sm text-gray-300 hover:text-white transition cursor-pointer font-medium'
        >
          <span>View All</span>
          <ArrowRight className='group-hover:translate-x-1 transition w-4 h-4 text-primary' />
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {previewMovies.map((movie) => (
          <UpcomingCard
            key={movie._id}
            movie={movie}
            isTall={false}
            onClick={() => {
              navigate('/upcoming')
              window.scrollTo(0, 0)
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default UpcomingSection
