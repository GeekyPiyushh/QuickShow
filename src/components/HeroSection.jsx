import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, Calendar, ClockIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SLIDES } from '../assets/assets'

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for Next, -1 for Prev
  const navigate = useNavigate()

  // Auto-play slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [currentIndex])

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }

  const currentSlide = SLIDES[currentIndex]

  // Animation variants
  const slideVariants = {
    initial: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeIn' },
    }),
  }

  const bgVariants = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Background Image Crossfade Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id + '-bg'}
          variants={bgVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${currentSlide.bgImage}")` }}
        >
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-16 lg:px-36">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-start gap-4 max-w-2xl"
          >
            {/* Logo */}
            {currentSlide.logo && (
              <img
                src={currentSlide.logo}
                alt="Studio Logo"
                className="max-h-11 lg:h-11 mt-10"
              />
            )}

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl md:text-[70px] md:leading-[1.1] font-semibold tracking-tight">
              {currentSlide.title}
            </h1>

            {/* Movie Meta Information */}
            <div className="flex items-center gap-4 text-gray-300 text-sm sm:text-base font-medium">
              <span>{currentSlide.genres}</span>
              <span className="text-gray-500">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" />
                {currentSlide.year}
              </div>
              <span className="text-gray-500">•</span>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-primary" />
                {currentSlide.duration}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm sm:text-base line-clamp-3 max-w-md leading-relaxed">
              {currentSlide.description}
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/movies')}
              className="mt-2 flex items-center gap-2 px-6 py-3 text-sm sm:text-base bg-primary hover:bg-primary-dull rounded-full transition-all font-semibold shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              Explore Movies <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Carousel Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroSection