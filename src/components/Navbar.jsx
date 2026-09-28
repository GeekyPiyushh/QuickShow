import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { BookmarkIcon, MenuIcon, TicketPlus, XIcon, Shield, LogOut, User as UserIcon } from 'lucide-react'
import { HashLink } from 'react-router-hash-link'
import AuthModal from './AuthModal'
import { getCurrentUser, logout } from '../lib/api'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  const syncUser = () => {
    setCurrentUser(getCurrentUser())
  }

  useEffect(() => {
    syncUser()
    window.addEventListener('auth-change', syncUser)
    window.addEventListener('storage', syncUser)
    return () => {
      window.removeEventListener('auth-change', syncUser)
      window.removeEventListener('storage', syncUser)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    toast.success('Logged out successfully.')
    navigate('/')
  }

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user)
        }}
      />

      <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 md:px-16 lg:px-36 py-4 md:py-5 gap-3 sm:gap-5 md:bg-transparent backdrop-blur-md md:backdrop-blur-none'>
        <Link to='/' className='max-md:flex-1'>
          <img src={assets.logo} alt='' className='w-32 sm:w-40 h-auto' />
        </Link>

        <div
          className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:w-full max-md:h-screen max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 md:px-8 py-3 md:rounded-full backdrop-blur bg-black/90 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
          }`}
        >
          <XIcon
            className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer'
            onClick={() => setIsOpen(false)}
          />
          <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/'>Home</Link>
          <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/movies'>Movies</Link>
          <HashLink smooth to='/#CineNews' onClick={() => setIsOpen(false)}>CineNews</HashLink>

          {currentUser?.role === 'admin' && (
            <Link
              to='/admin'
              onClick={() => { scrollTo(0, 0); setIsOpen(false) }}
              className='text-primary font-semibold flex items-center gap-1.5'
            >
              <Shield className='w-4 h-4' /> Admin Panel
            </Link>
          )}
        </div>

        <div className='flex items-center gap-3 sm:gap-5'>
          <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/favourite'>
            <BookmarkIcon className='w-5 h-5 sm:w-6 sm:h-6 cursor-pointer text-gray-300 hover:text-white transition' />
          </Link>

          {currentUser ? (
            <div className='flex items-center gap-2.5 sm:gap-3'>
              <button
                onClick={() => navigate('/my-bookings')}
                title='My Bookings'
                className='flex items-center gap-1.5 text-xs sm:text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-gray-200 transition cursor-pointer'
              >
                <TicketPlus className='w-4 h-4 text-primary' />
                <span className='max-sm:hidden'>Bookings</span>
              </button>

              <div className='flex items-center gap-2 pl-1'>
                <span className='text-xs text-gray-300 font-medium max-md:hidden'>
                  {currentUser.name}
                  {currentUser.role === 'admin' && (
                    <span className='ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded'>
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  title='Logout'
                  className='p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition cursor-pointer'
                >
                  <LogOut className='w-4 h-4' />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className='px-4 py-1 sm:px-6 sm:py-2 bg-primary hover:bg-primary-dull rounded-full text-xs sm:text-sm font-medium transition cursor-pointer shadow'
            >
              Login
            </button>
          )}
        </div>

        <MenuIcon
          onClick={() => setIsOpen(true)}
          className='max-md:ml-2 md:hidden w-7 h-7 sm:w-8 sm:h-8 cursor-pointer'
        />
      </div>
    </>
  )
}

export default Navbar