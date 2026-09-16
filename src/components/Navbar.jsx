import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { BookmarkIcon, MenuIcon, SearchIcon, TicketPlus, XIcon } from 'lucide-react'
import { SignInButton, SignUpButton, useClerk, UserButton, useUser } from '@clerk/react'
import { HashLink } from 'react-router-hash-link'

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false)
  const {user} = useUser()
  const {openSignIn} = useClerk()
  const navigate = useNavigate()

  return (

    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 md:px-16 lg:px-36 py-4 md:py-5 gap-3 sm:gap-5 md:bg-transparent backdrop-blur-md md:backdrop-blur-none'> 

      <Link to='/' className='max-md:flex-1'> <img src={assets.logo} alt="" className='w-32 sm:w-40 h-auto'/></Link>

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:w-full max-md:h-screen max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 md:px-8 py-3 md:rounded-full backdrop-blur bg-black/90 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-all duration-300 ${isOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={() => setIsOpen(false)}/>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/'>Home</Link>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/movies'>Movies</Link>
        <HashLink smooth to="/#CineNews" onClick={() => setIsOpen(false)}>CineNews</HashLink>

      </div>

      <div className='flex items-center gap-4 sm:gap-6'>

        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/favourite'><BookmarkIcon className='w-6 h-6 cursor-pointer'/></Link>
        {user ? <UserButton afterSignOutUrl="/">
          <UserButton.MenuItems>
            <UserButton.Action onClick={() => navigate('/my-bookings')} label='My Bookings' labelIcon={<TicketPlus width={15}/>}/>
          </UserButton.MenuItems>
        </UserButton> : 
          (<button onClick={() => openSignIn()} className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull rounded-full text-sm sm:text-base'>Login
          </button>)}

      </div>
      <MenuIcon onClick={() => setIsOpen(true)} className='max-md:ml-2 md:hidden w-7 h-7 sm:w-8 sm:h-8 cursor-pointer'/>
    </div>
  )
}

export default Navbar