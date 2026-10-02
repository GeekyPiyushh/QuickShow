import React, { useState } from 'react'
import Title from '../../components/admin/Title'
import { createMovie } from '../../lib/api'
import toast from 'react-hot-toast'
import { Film, Image as ImageIcon, Calendar, Clock, Star, Globe, Tag, PlusCircle } from 'lucide-react'
import { genres as availableGenres, languages as availableLanguages } from '../../assets/assets'

// Quick poster suggestions for demo convenience
const POSTER_PRESETS = [
  {
    name: 'Jawan (Action/Thriller)',
    url: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
  {
    name: 'Stree 2 (Horror/Comedy)',
    url: 'https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg',
  },
  {
    name: 'Parasite (Korean/Thriller)',
    url: 'https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  },
  {
    name: 'Deadpool & Wolverine (Action/Comedy)',
    url: 'https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  },
  {
    name: 'Oppenheimer (Drama/Thriller)',
    url: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  },
  {
    name: 'Dune: Part Two (Sci-Fi/Adventure)',
    url: 'https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  },
  {
    name: 'Spider-Man (Family/Adventure)',
    url: 'https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
  },
  {
    name: 'Chaal Jeevi Laiye (Family/Comedy)',
    url: 'https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg',
  }
]

const AddMovie = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedGenres, setSelectedGenres] = useState(['Action'])
  const [language, setLanguage] = useState('English')
  const [duration, setDuration] = useState('120')
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0])
  const [poster, setPoster] = useState(POSTER_PRESETS[0].url)
  const [rating, setRating] = useState('7.5')
  const [status, setStatus] = useState('now_showing')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleGenre = (genreName) => {
    if (selectedGenres.includes(genreName)) {
      if (selectedGenres.length === 1) {
        return toast.error('Please keep at least one genre.')
      }
      setSelectedGenres(selectedGenres.filter((g) => g !== genreName))
    } else {
      setSelectedGenres([...selectedGenres, genreName])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      return toast.error('Please enter a movie title.')
    }
    if (!description.trim()) {
      return toast.error('Please enter a description.')
    }
    if (selectedGenres.length === 0) {
      return toast.error('Please select at least one genre.')
    }
    if (!duration || Number(duration) <= 0) {
      return toast.error('Please enter a valid movie duration in minutes.')
    }
    if (!releaseDate) {
      return toast.error('Please enter a release date.')
    }

    setIsSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        genre: selectedGenres,
        language: language.trim(),
        duration: Number(duration),
        releaseDate: new Date(releaseDate),
        poster: poster.trim(),
        rating: Number(rating) || 7.0,
        status: status,
      }

      const res = await createMovie(payload)

      if (res && res.success) {
        toast.success(`"${title}" has been successfully added to the database!`)
        // Reset form
        setTitle('')
        setDescription('')
        setSelectedGenres(['Action'])
        setDuration('120')
        setRating('7.5')
      } else {
        toast.error(res?.message || 'Failed to add movie.')
      }
    } catch (err) {
      toast.error(err.message || 'Error communicating with backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='max-w-4xl'>
      <Title text1='Add' text2='Movie' />
      <p className='text-sm text-gray-400 mt-2 mb-8'>
        Add new cinema movies directly into the MongoDB catalog. Once added, movies immediately appear on the site and become available for scheduling shows.
      </p>

      <form onSubmit={handleSubmit} className='space-y-6'>
        
        {/* Title */}
        <div>
          <label className='block text-xs font-medium text-gray-300 mb-1.5'>Movie Title *</label>
          <div className='flex items-center bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 focus-within:border-primary transition'>
            <Film className='w-4 h-4 text-gray-400 mr-3 shrink-0' />
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g., Gladiator II'
              className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className='block text-xs font-medium text-gray-300 mb-1.5'>Overview / Synopsis *</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Write a brief synopsis of the movie storyline...'
            className='w-full bg-primary/10 border border-primary/20 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary transition'
            required
          />
        </div>

        {/* Poster Image URL with Preset Suggestions */}
        <div>
          <label className='block text-xs font-medium text-gray-300 mb-1.5'>Poster Image URL</label>
          <div className='flex items-center bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 focus-within:border-primary transition'>
            <ImageIcon className='w-4 h-4 text-gray-400 mr-3 shrink-0' />
            <input
              type='url'
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              placeholder='https://image.tmdb.org/t/p/original/...'
              className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
            />
          </div>

          {/* Quick preset selector */}
          <div className='flex flex-wrap items-center gap-2 mt-2.5'>
            <span className='text-[11px] text-gray-400'>Presets:</span>
            {POSTER_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type='button'
                onClick={() => {
                  setPoster(preset.url)
                  if (!title) setTitle(preset.name)
                }}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  poster === preset.url
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-primary/50'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Genres Selection */}
        <div>
          <label className='block text-xs font-medium text-gray-300 mb-2'>
            Select Genres * ({selectedGenres.join(', ')})
          </label>
          <div className='flex flex-wrap gap-2'>
            {availableGenres.map((g) => {
              const active = selectedGenres.includes(g)
              return (
                <button
                  key={g}
                  type='button'
                  onClick={() => toggleGenre(g)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    active
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              )
            })}
          </div>
        </div>

        {/* Grid for Language, Duration, Rating, Status */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
          {/* Language */}
          <div>
            <label className='block text-xs font-medium text-gray-300 mb-1.5'>Language</label>
            <div className='flex items-center bg-primary/10 border border-primary/20 rounded-xl px-3 py-2'>
              <Globe className='w-4 h-4 text-gray-400 mr-2 shrink-0' />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className='bg-transparent text-sm text-white outline-none w-full'
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang} className='bg-stone-900 text-white'>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className='block text-xs font-medium text-gray-300 mb-1.5'>Duration (mins)</label>
            <div className='flex items-center bg-primary/10 border border-primary/20 rounded-xl px-3 py-2'>
              <Clock className='w-4 h-4 text-gray-400 mr-2 shrink-0' />
              <input
                type='number'
                min='1'
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder='120'
                className='bg-transparent text-sm text-white outline-none w-full'
                required
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className='block text-xs font-medium text-gray-300 mb-1.5'>Rating (0 - 10)</label>
            <div className='flex items-center bg-primary/10 border border-primary/20 rounded-xl px-3 py-2'>
              <Star className='w-4 h-4 text-primary fill-primary mr-2 shrink-0' />
              <input
                type='number'
                step='0.1'
                min='0'
                max='10'
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder='7.5'
                className='bg-transparent text-sm text-white outline-none w-full'
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className='block text-xs font-medium text-gray-300 mb-1.5'>Catalog Status</label>
            <div className='flex items-center bg-primary/10 border border-primary/20 rounded-xl px-3 py-2'>
              <Tag className='w-4 h-4 text-gray-400 mr-2 shrink-0' />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className='bg-transparent text-sm text-white outline-none w-full'
              >
                <option value='now_showing' className='bg-stone-900 text-white'>Now Showing</option>
                <option value='upcoming' className='bg-stone-900 text-white'>Upcoming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Release Date */}
        <div className='max-w-xs'>
          <label className='block text-xs font-medium text-gray-300 mb-1.5'>Release Date</label>
          <div className='flex items-center bg-primary/10 border border-primary/20 rounded-xl px-3 py-2'>
            <Calendar className='w-4 h-4 text-gray-400 mr-2 shrink-0' />
            <input
              type='date'
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className='bg-transparent text-sm text-white outline-none w-full'
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className='pt-4'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-xl font-medium text-sm transition cursor-pointer active:scale-95 disabled:opacity-50'
          >
            <PlusCircle className='w-4 h-4' />
            {isSubmitting ? 'Adding Movie to Database...' : 'Add Movie to Catalog'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddMovie
