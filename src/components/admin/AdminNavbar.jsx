import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { login, logout, getCurrentUser } from '../../lib/api'
import toast from 'react-hot-toast'

const AdminNavbar = () => {
  const [adminUser, setAdminUser] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const checkAuth = () => {
    const user = getCurrentUser()
    const token = localStorage.getItem('token')
    if (user && token && user.role === 'admin') {
      setAdminUser(user)
    } else {
      setAdminUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
    window.addEventListener('auth-change', checkAuth)
    window.addEventListener('storage', checkAuth)
    return () => {
      window.removeEventListener('auth-change', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  const handleAdminLogin = async () => {
    setIsLoggingIn(true)
    try {
      const res = await login('admin@example.com', 'admin123')
      if (res && res.success) {
        toast.success('Logged in as Administrator!')
        checkAuth()
      } else {
        toast.error(res?.message || 'Admin login failed.')
      }
    } catch {
      toast.error('Could not connect to backend server.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleAdminLogout = () => {
    logout()
    checkAuth()
    toast.success('Logged out from Admin session.')
  }

  return (
    <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
      <div className='flex items-center gap-4 sm:gap-6'>
        <Link to='/'>
          <img src={assets.logo} alt="logo" className='w-32 sm:w-36 h-auto' />
        </Link>
        <Link
          to='/'
          className='text-xs text-gray-400 hover:text-white border border-white/10 px-2.5 py-1 rounded transition max-sm:hidden'
        >
          ← Return to Website
        </Link>
      </div>

      <div className='flex items-center gap-3'>
        {adminUser ? (
          <div className='flex items-center gap-3'>
            <span className='text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium'>
              ● Admin: {adminUser.name}
            </span>
            <button
              onClick={handleAdminLogout}
              className='text-xs text-gray-400 hover:text-white px-2 py-1 rounded border border-gray-600 transition cursor-pointer'
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            disabled={isLoggingIn}
            onClick={handleAdminLogin}
            className='text-xs bg-primary hover:bg-primary-dull text-white px-3 py-1.5 rounded-full font-medium transition cursor-pointer disabled:opacity-50'
          >
            {isLoggingIn ? 'Logging in...' : 'Admin Login'}
          </button>
        )}
      </div>
    </div>
  )
}

export default AdminNavbar
