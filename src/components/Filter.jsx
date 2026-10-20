import React, { useState } from 'react'
import { ChevronDown, SlidersHorizontal, Globe, Film, Check, X, RotateCcw, Sparkles } from 'lucide-react'
import { languages, genres } from '../assets/assets'

const FilterGroup = ({ title, icon: Icon, items, selectedItems, onToggle }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-white/15 rounded-2xl overflow-hidden transition-all duration-300 shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-5 py-3.5 text-left font-medium text-sm text-gray-200 cursor-pointer select-none hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-white/5 text-primary border border-white/10">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-wide text-sm sm:text-base text-gray-100">{title}</span>
          {selectedItems.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary/20 text-rose-300 border border-primary/40 shadow-sm shadow-primary/20">
              {selectedItems.length} selected
            </span>
          )}
        </div>
        <div className="p-1 rounded-md text-gray-400 hover:text-white transition">
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 flex flex-wrap gap-2 sm:gap-2.5 border-t border-white/[0.06] bg-black/20">
          {items.map((item, index) => {
            const isSelected = selectedItems.includes(item)
            return (
              <button
                type="button"
                key={index}
                onClick={() => onToggle(item)}
                className={`px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 border-rose-400 text-white shadow-lg shadow-rose-900/40 ring-1 ring-white/20 font-semibold'
                    : 'bg-white/[0.04] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.08] hover:border-white/25 hover:shadow-sm'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{item}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const Filter = ({ selectedLanguages, setSelectedLanguages, selectedGenres, setSelectedGenres, totalResults }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleItem = (item, list, setList) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  const clearAll = () => {
    setSelectedLanguages([])
    setSelectedGenres([])
  }

  const activeCount = selectedLanguages.length + selectedGenres.length

  return (
    <div className="w-full mb-10 text-white relative">
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-primary/30 to-rose-500/10 border border-primary/30 text-rose-400 shadow-md shadow-primary/20">
              <SlidersHorizontal className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">Filter Movies</h2>
                {activeCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-500 text-white shadow-sm shadow-rose-900/50">
                    {activeCount} active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Narrow down by your preferred language and genre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer"
            >
              <span>{isMobileOpen ? 'Hide' : 'Show'} Filters</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="pt-3 pb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-primary" /> Active:
            </span>
            {selectedLanguages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-rose-500/15 border border-rose-500/30 text-rose-200"
              >
                <span>{lang}</span>
                <button
                  type="button"
                  onClick={() => toggleItem(lang, selectedLanguages, setSelectedLanguages)}
                  className="hover:text-white cursor-pointer"
                  title={`Remove ${lang}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedGenres.map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/15 border border-primary/30 text-rose-200"
              >
                <span>{genre}</span>
                <button
                  type="button"
                  onClick={() => toggleItem(genre, selectedGenres, setSelectedGenres)}
                  className="hover:text-white cursor-pointer"
                  title={`Remove ${genre}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className={`mt-4 ${isMobileOpen ? 'grid' : 'hidden md:grid'} grid-cols-1 lg:grid-cols-2 gap-4`}>
          <FilterGroup
            title="Languages"
            icon={Globe}
            items={languages}
            selectedItems={selectedLanguages}
            onToggle={(lang) => toggleItem(lang, selectedLanguages, setSelectedLanguages)}
          />
          <FilterGroup
            title="Genres"
            icon={Film}
            items={genres}
            selectedItems={selectedGenres}
            onToggle={(genre) => toggleItem(genre, selectedGenres, setSelectedGenres)}
          />
        </div>
      </div>
    </div>
  )
}

export default Filter