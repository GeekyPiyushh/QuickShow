import React, { useState, useEffect } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet, Link } from 'react-router-dom'
import { getCurrentUser, login } from '../../lib/api'
import { ShieldAlert, Lock, Mail, ArrowLeft, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

const Layout = () => {
  const [adminUser, setAdminUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Auth gate form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const verifyAdmin = () => {
    const token = localStorage.getItem('token')
    const user = getCurrentUser()
    if (token && user && user.role === 'admin') {
      setAdminUser(user)
    } else {
      setAdminUser(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    verifyAdmin()
    window.addEventListener('auth-change', verifyAdmin)
    window.addEventListener('storage', verifyAdmin)
    return () => {
      window.removeEventListener('auth-change', verifyAdmin)
      window.removeEventListener('storage', verifyAdmin)
    }
  }, [])

  const handleAdminSignIn = async (e) => {
    if (e) e.preventDefault()
    if (!email || !password) {
      return toast.error('Please enter admin email and password.')
    }

    setIsLoggingIn(true)
    try {
      const res = await login(email.trim(), password)
      if (res && res.success) {
        if (res.user.role !== 'admin') {
          toast.error('This account does not have administrator privileges.')
          return
        }
        toast.success(`Welcome to Admin Panel, ${res.user.name}!`)
        setAdminUser(res.user)
      } else {
        toast.error(res?.message || 'Invalid administrator credentials.')
      }
    } catch {
      toast.error('Could not connect to backend server.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleDemoAdminLogin = async () => {
    setEmail('admin@example.com')
    setPassword('admin123')
    setIsLoggingIn(true)
    try {
      const res = await login('admin@example.com', 'admin123')
      if (res && res.success && res.user.role === 'admin') {
        toast.success('Admin authenticated successfully!')
        setAdminUser(res.user)
      } else {
        toast.error(res?.message || 'Login failed.')
      }
    } catch {
      toast.error('Failed to connect to backend server.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return null
  }

  // Unauthorized view: Render access gate
  if (!adminUser) {
    const currentUser = getCurrentUser()
    return (
      <div className='min-h-screen bg-black flex flex-col justify-center items-center px-4 py-12'>
        <div className='w-full max-w-md bg-stone-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl'>
          
          <div className='flex justify-center mb-4'>
            <div className='p-3 bg-red-500/10 border border-red-500/30 rounded-full text-red-500'>
              <ShieldAlert className='w-8 h-8' />
            </div>
          </div>

          <h2 className='text-2xl font-bold text-center text-white mb-1'>Administrator Access Required</h2>
          <p className='text-xs sm:text-sm text-gray-400 text-center mb-6'>
            The page you are trying to access requires administrator authentication.
          </p>

          {currentUser && currentUser.role !== 'admin' && (
            <div className='mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300'>
              Signed in as <span className='font-semibold'>{currentUser.name}</span> ({currentUser.email}). This account has regular user role and cannot access the admin panel.
            </div>
          )}

          <button
            type='button'
            onClick={handleDemoAdminLogin}
            disabled={isLoggingIn}
            className='w-full mb-5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg py-2 transition cursor-pointer font-medium disabled:opacity-50'
          >
            Click here for Instant Demo Admin Login
          </button>

          <form onSubmit={handleAdminSignIn} className='space-y-4'>
            <div>
              <label className='block text-xs font-medium text-gray-300 mb-1.5'>Admin Email</label>
              <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-primary transition'>
                <Mail className='w-4 h-4 text-gray-400 mr-2.5 shrink-0' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='admin@example.com'
                  className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                  required
                />
              </div>
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-300 mb-1.5'>Password</label>
              <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-primary transition'>
                <Lock className='w-4 h-4 text-gray-400 mr-2.5 shrink-0' />
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoggingIn}
              className='w-full mt-2 py-3 bg-primary hover:bg-primary-dull text-white rounded-xl font-medium text-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50'
            >
              <LogIn className='w-4 h-4' />
              {isLoggingIn ? 'Verifying...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className='mt-6 pt-5 border-t border-white/10 flex justify-center'>
            <Link
              to='/'
              className='flex items-center gap-2 text-xs text-gray-400 hover:text-white transition'
            >
              <ArrowLeft className='w-3.5 h-3.5' />
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AdminNavbar />
      <div className='flex'>
        <AdminSidebar />
        <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default Layout
