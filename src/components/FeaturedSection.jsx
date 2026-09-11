import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyShowsData } from '../assets/assets'
import MovieCard from './MovieCard'

const FeaturedSection = () => {

    const navigate = useNavigate()

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>

        <div className='relative flex items-center justify-between pt-20 pb-10'>
            <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
            <button onClick={() => navigate('/movies')} className='flex group items-center gap-2 text-gray-300 cursor-pointer'>
                View All
                <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>    
            </button>
        </div>

        <div className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 md:gap-8 mt-8 justify-center'>
            {dummyShowsData.slice(0,4).map((show) => (
            <MovieCard key={show._id} movie={show} />
            ))}
        </div>

        <div className='flex justify-center'>
            <button onClick={() => {navigate('/movies'); scrollTo(0,0)}} className='px-10 py-3 bg-primary hover:bg-primary-dull cursor-pointer rounded-full transition font-medium mt-10'>Show More </button>
        </div>
      
    </div>
  )
}

export default FeaturedSection
