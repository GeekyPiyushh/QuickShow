import { useState, useEffect } from 'react'
import { Search, Star, Bell, Play, Tag, Clock, X, Check, Calendar } from 'lucide-react'
import { dummyUpcomingData } from '../assets/assets'
import UpcomingCard from '../components/UpcomingCard'
import toast from 'react-hot-toast'
import { getMovies } from '../lib/api'

const getYouTubeEmbedUrl = (url) => {
  if (!url) return ''
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = (match && match[2].length === 11) ? match[2] : null
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : url
}

const ComingSoon = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [upcomingList, setUpcomingList] = useState(dummyUpcomingData)
  const [remindedMovies, setRemindedMovies] = useState({})
  const [selectedMovie, setSelectedMovie] = useState(null)

  useEffect(() => {
    async function loadLiveUpcoming() {
      try {
        const live = await getMovies()
        if (live && Array.isArray(live)) {
          const upcomingOnly = live.filter(m => m.status === 'upcoming')
          if (upcomingOnly.length > 0) {
            const normalizedLive = upcomingOnly.map(m => ({
              _id: m._id || m.id,
              id: m.id || m._id,
              title: m.title,
              subTitle: m.tagline || m.title,
              backdrop: m.backdrop_path || m.poster || dummyUpcomingData[0].backdrop,
              poster: m.poster || m.poster_path || dummyUpcomingData[0].poster,
              rating: m.rating || m.vote_average || '9.0',
              badge: 'Upcoming',
              genres: Array.isArray(m.genre)
                ? m.genre
                : (m.genres ? m.genres.map(g => (typeof g === 'object' ? g.name : g)) : ['Action']),
              releaseDate: m.releaseDate
                ? (m.releaseDate.length <= 12 ? m.releaseDate : new Date(m.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
                : 'Coming Soon',
              logline: m.description || m.overview || '',
              trailerUrl: m.trailer || m.trailerUrl || 'https://www.youtube.com/watch?v=WpW36ldAqnM'
            }))
            const existingTitles = new Set(normalizedLive.map(m => m.title.toLowerCase()))
            const filteredDummies = dummyUpcomingData.filter(d => !existingTitles.has(d.title.toLowerCase()))
            setUpcomingList([...normalizedLive, ...filteredDummies])
          }
        }
      } catch (e) {
        console.warn('Failed to fetch live upcoming movies:', e)
      }
    }
    loadLiveUpcoming()
  }, [])

  const heroMovie = upcomingList[0] || dummyUpcomingData[0]
  const tallCardMovie = upcomingList[1] || dummyUpcomingData[1]
  const gridMovies = upcomingList.slice(2)

  // Filter grid movies based on search input
  const filteredGrid = gridMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRemindMe = (movie) => {
    const key = movie._id || movie.title
    const isReminded = remindedMovies[key]
    if (isReminded) {
      setRemindedMovies(prev => ({ ...prev, [key]: false }))
      toast('Reminder cancelled', { icon: '🔕' })
    } else {
      setRemindedMovies(prev => ({ ...prev, [key]: true }))
      toast.success(`Reminder set for "${movie.title}"! We'll alert you on ${movie.releaseDate || 'launch'}.`, {
        icon: '🔔',
        duration: 4000
      })
    }
  }

  const isHeroReminded = heroMovie && remindedMovies[heroMovie._id || heroMovie.title]

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pb-20">
      
      {/* 1. SEAMLESS HERO SECTION WITH INTEGRATED HEADING */}
      <div className="relative w-full min-h-[720px] flex flex-col justify-between px-6 md:px-16 lg:px-28 pt-28 pb-12 overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <img
            src={heroMovie.backdrop}
            alt={heroMovie.title}
            className="w-full h-full object-cover object-top opacity-75"
          />
        
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d1117]/50 to-[#0d1117]" />
        </div>

        {/* Hero Movie Content Area */}
        <div className="relative z-10 max-w-2xl flex flex-col gap-4 mt-8">
          
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-primary text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
              {heroMovie.rating ? `★ ${heroMovie.rating}` : (heroMovie.badge || 'EXCLUSIVE PREVIEW')}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase drop-shadow-md">
            {heroMovie.title}
          </h1>

          <div className="flex items-center flex-wrap gap-3 text-xs text-gray-300 font-medium">
            <div className="flex items-center gap-1 text-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-primary stroke-primary" />
              ))}
            </div>
            <span className="text-gray-500">|</span>
            <div className="flex items-center gap-1 text-gray-300">
              <Tag className="w-3 h-3 text-primary" />
              <span>{Array.isArray(heroMovie.genres) ? heroMovie.genres.join(' • ') : heroMovie.genres}</span>
            </div>
            <span className="text-gray-500">|</span>
            <div className="flex items-center gap-1 text-primary font-semibold">
              <Clock className="w-3 h-3 text-primary" />
              <span>{heroMovie.releaseDate}</span>
            </div>
          </div>

          <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed line-clamp-4 max-w-xl">
            {heroMovie.logline}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => setSelectedMovie(heroMovie)}
              className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/40 text-xs font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer tracking-wider active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>READ MORE</span>
            </button>
            <button
              onClick={() => handleRemindMe(heroMovie)}
              className={`flex items-center gap-2 text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer shadow-lg tracking-wider active:scale-95 ${
                isHeroReminded
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-primary/90 hover:bg-primary-dull'
              }`}
            >
              {isHeroReminded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>REMINDER SET</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>REMIND ME</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative z-10 text-center mt-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Upcoming Releases
          </h2>
          <p className="mt-5 text-gray-400 font-normal">
            All Upcoming Launches.
          </p>
        </div>

      </div>

      {/* 2. ASYMMETRICAL MOVIE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 md:px-16 lg:px-28 my-12">
        
        <div className="lg:col-span-1">
          <UpcomingCard
            movie={tallCardMovie}
            isTall={true}
            onClick={(m) => setSelectedMovie(m)}
          />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredGrid.length > 0 ? (
            filteredGrid.map((movie) => (
              <UpcomingCard
                key={movie._id}
                movie={movie}
                isTall={false}
                onClick={(m) => setSelectedMovie(m)}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <p className="text-gray-400 text-sm">
                No upcoming movies match "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM PILL SEARCH BAR */}
      <div className="flex flex-col items-center gap-3 max-w-md mx-auto text-center px-6">
        <p className="text-xs text-gray-400">
          Looking for something else? Search our upcoming releases:
        </p>
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try "The Lord of the Rings"'
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-6 pr-12 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition shadow-inner"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 4. MODAL FOR TRAILER / DETAILS */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video / Backdrop */}
            <div className="relative aspect-video w-full bg-black">
              {selectedMovie.trailerUrl ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedMovie.trailerUrl)}
                  title={selectedMovie.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={selectedMovie.backdrop || selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Content Details */}
            <div className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                  {selectedMovie.title}
                </h3>
                <span className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedMovie.releaseDate}
                </span>
              </div>

              {selectedMovie.subTitle && (
                <p className="text-xs text-primary font-medium tracking-wide">
                  {selectedMovie.subTitle}
                </p>
              )}

              <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                {selectedMovie.logline || selectedMovie.overview || 'No additional synopsis available yet.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {Array.isArray(selectedMovie.genres)
                      ? selectedMovie.genres.join(' • ')
                      : selectedMovie.genres}
                  </span>
                </div>

                <button
                  onClick={() => handleRemindMe(selectedMovie)}
                  className={`flex items-center gap-2 text-xs font-semibold px-5 py-2 rounded-lg transition cursor-pointer shadow-md ${
                    remindedMovies[selectedMovie._id || selectedMovie.title]
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-primary hover:bg-primary-dull text-white'
                  }`}
                >
                  {remindedMovies[selectedMovie._id || selectedMovie.title] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>REMINDER SET</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>REMIND ME</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ComingSoon
