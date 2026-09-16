import MovieCard from '../components/MovieCard'
import { dummyShowsData, genres, languages } from '../assets/assets'
import { ChevronRight } from 'lucide-react'
import Filter from '../components/Filter'
import { useState } from 'react'

const Movies = () => {

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const filteredMovies = dummyShowsData.filter((show) => {
    const matchesLanguage =
      selectedLanguages.length === 0 ||
      show.languages.some((lang) => selectedLanguages.includes(lang.name))

    const matchesGenre =
      selectedGenres.length === 0 ||
      show.genres.some((genre) => selectedGenres.includes(genre.name))

    return matchesLanguage && matchesGenre
  })

  return filteredMovies.length > 0 ? (
    <div className='relative pt-35 pb-20 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
        
      <Filter selectedLanguages={selectedLanguages}
              setSelectedLanguages={setSelectedLanguages}
              selectedGenres={selectedGenres}
              setSelectedGenres={setSelectedGenres}/>

      {/* "Coming Soon" Announcement Bar */}
      <div className='flex justify-between items-start gap-3 bg-white/8 backdrop-blur-md rounded-2xl p-4 sm:px-6 mb-10 transition'>

        <h2 className='text-sm sm:text-base font-medium'>Coming Soon</h2>
   
        <div className='flex items-center gap-1 text-sm sm:text-base font-medium text-primary hover:text-primary-dull cursor-pointer transition group'>
          <p>Explore Upcoming Movies</p>
          <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform'/>
        </div>
      </div>

        <h1 className='text-lg font-medium my-4'>Now Showing</h1>

        <div className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 md:gap-8 mt-8 justify-center'>
          {filteredMovies.map((show) => (
            <MovieCard key={show._id} movie={show}/>
          ))}
        </div>
    </div>
  ) : (
<div className='mt-40 flex flex-col items-center justify-center py-20 px-4 border border-dashed border-white/10 rounded-2xl bg-white/5 my-8 text-center'>
    <h2 className='text-xl sm:text-2xl font-bold text-gray-200 mb-2'>
      No Movies Available for this Filter
    </h2>
    <p className='text-xs sm:text-sm text-gray-400 max-w-sm mb-6'>
      We couldn't find any titles matching your selected languages and genres. Try clearing some filters.
    </p>
    <button
      onClick={() => {
        setSelectedLanguages([])
        setSelectedGenres([])
      }}
      className='bg-primary hover:bg-primary-dull text-white text-xs font-semibold px-5 py-2.5 rounded-full transition active:scale-95 shadow-lg cursor-pointer'
    >
      Reset Filters
    </button>
  </div>
  )
}

export default Movies
