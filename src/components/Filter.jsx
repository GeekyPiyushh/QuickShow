import React, { useState } from 'react'
import { ChevronDown, Filter as FilterIcon } from 'lucide-react'
import { languages, genres } from '../assets/assets'

// Reusable Accordion Group Component
const FilterGroup = ({ title, items, selectedItems, onToggle }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left font-medium text-sm text-gray-200 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          <span>{title}</span>
          {selectedItems.length > 0 && (
            <span className="text-xs text-primary font-semibold">({selectedItems.length})</span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 border-t border-white/5">
          {items.map((item, index) => {
            const isSelected = selectedItems.includes(item)
            return (
              <button
                key={index}
                onClick={() => onToggle(item)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-primary border-primary text-white shadow-lg' 
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Main Filter Component
const Filter = ({ selectedLanguages, setSelectedLanguages, selectedGenres, setSelectedGenres }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleItem = (item, list, setList) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  return (
    <div className="w-full max-w-lg mb-8 text-white">
      {/* Filters Main Heading */}
      <h1 className="text-xl font-bold text-white mb-3 hidden md:block">Filter</h1>

      {/* Mobile Trigger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium mb-4 cursor-pointer"
      >
        <FilterIcon className="w-4 h-4 text-primary" />
        <span>Filters</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Accordions Container */}
      <div className={`${isMobileOpen ? 'flex' : 'hidden md:flex'} flex-col gap-3`}>
        <FilterGroup
          title="Languages"
          items={languages}
          selectedItems={selectedLanguages}
          onToggle={(lang) => toggleItem(lang, selectedLanguages, setSelectedLanguages)}
        />
        <FilterGroup
          title="Genres"
          items={genres}
          selectedItems={selectedGenres}
          onToggle={(genre) => toggleItem(genre, selectedGenres, setSelectedGenres)}
        />
      </div>
    </div>
  )
}

export default Filter