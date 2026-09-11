import React from 'react'
import MovieCard from '../components/MovieCard'
import { dummyShowsData } from '../assets/assets'

const Movies = () => {
  return dummyShowsData.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
        <h1 className='text-lg font-medium my-4'>Now Showing</h1>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 md:gap-8 mt-8 justify-center'>
          {dummyShowsData.map((show) => (
            <MovieCard key={show._id} movie={show}/>
          ))}
        </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xll font-bold text-center'>No Movies Available</h1>
    </div>
  )
}

export default Movies
