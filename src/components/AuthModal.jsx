import React, { useState } from 'react'
import { X, User, ShieldCheck, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
import { login, register } from '../lib/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('user') // 'user' | 'admin'
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  if (!isOpen) return null

  const handleFillDemoUser = () => {
    setEmail('piyush@example.com')
    setPassword('password123')
    setIsRegister(false)
  }

  const handleFillDemoAdmin = () => {
    setEmail('admin@example.com')
    setPassword('admin123')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      return toast.error('Please enter both email and password.')
    }

    if (activeTab === 'user' && isRegister && !name.trim()) {
      return toast.error('Please enter your name.')
    }

    setLoading(true)

    try {
      if (activeTab === 'user' && isRegister) {
        // Registration flow
        const res = await register(name.trim(), email.trim(), password)
        if (res && res.success) {
          toast.success('Registration successful! Logging you in...')
          // Automatically log in after registration
          const loginRes = await login(email.trim(), password)
          if (loginRes && loginRes.success) {
            if (onAuthSuccess) onAuthSuccess(loginRes.user)
            onClose()
          } else {
            setIsRegister(false)
          }
        } else {
          toast.error(res?.message || 'Registration failed.')
        }
      } else {
        // Login flow (both User and Admin)
        const res = await login(email.trim(), password)
        if (res && res.success) {
          if (activeTab === 'admin' && res.user.role !== 'admin') {
            toast.error('This account does not have administrator privileges.')
            setLoading(false)
            return
          }

          toast.success(`Welcome, ${res.user.name}!`)
          if (onAuthSuccess) onAuthSuccess(res.user)
          onClose()

          if (activeTab === 'admin' || res.user.role === 'admin') {
            navigate('/admin')
          }
        } else {
          toast.error(res?.message || 'Invalid email or password.')
        }
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please check your backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
      <div className='relative w-full max-w-md bg-stone-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-200'>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-5 right-5 text-gray-400 hover:text-white transition cursor-pointer'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Modal Header */}
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold tracking-tight text-white'>
            {activeTab === 'admin' ? 'Admin Portal' : (isRegister ? 'Create Account' : 'Welcome Back')}
          </h2>
          <p className='text-xs sm:text-sm text-gray-400 mt-1'>
            {activeTab === 'admin'
              ? 'Sign in to access show scheduling and cinema management'
              : (isRegister ? 'Join SnapSeat to book movie tickets with ease' : 'Sign in to manage and view your bookings')}
          </p>
        </div>

        {/* Role Selector Tabs (User vs Admin) */}
        <div className='grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl mb-6 border border-white/5'>
          <button
            type='button'
            onClick={() => {
              setActiveTab('user')
              setIsRegister(false)
              setEmail('')
              setPassword('')
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'user' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className='w-4 h-4' />
            User Login
          </button>

          <button
            type='button'
            onClick={() => {
              setActiveTab('admin')
              setIsRegister(false)
              setEmail('')
              setPassword('')
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'admin' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className='w-4 h-4' />
            Admin Login
          </button>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className='mb-5'>
          {activeTab === 'user' ? (
            <button
              type='button'
              onClick={handleFillDemoUser}
              className='w-full text-xs text-primary hover:text-primary-dull bg-primary/10 border border-primary/20 rounded-lg py-1.5 transition cursor-pointer'
            >
              Demo User: Click to auto-fill credentials
            </button>
          ) : (
            <button
              type='button'
              onClick={handleFillDemoAdmin}
              className='w-full text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg py-1.5 transition cursor-pointer'
            >
              Demo Admin: Click to auto-fill credentials
            </button>
          )}
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {activeTab === 'user' && isRegister && (
            <div>
              <label className='block text-xs font-medium text-gray-300 mb-1.5'>Full Name</label>
              <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-primary transition'>
                <User className='w-4 h-4 text-gray-400 mr-2.5 shrink-0' />
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='John Doe'
                  className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className='block text-xs font-medium text-gray-300 mb-1.5'>
              {activeTab === 'admin' ? 'Admin Email' : 'Email Address'}
            </label>
            <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-primary transition'>
              <Mail className='w-4 h-4 text-gray-400 mr-2.5 shrink-0' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'admin' ? 'admin@example.com' : 'you@example.com'}
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
            disabled={loading}
            className='w-full mt-2 py-3 bg-primary hover:bg-primary-dull text-white rounded-xl font-medium text-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50'
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : activeTab === 'admin' ? (
              <>
                <LogIn className='w-4 h-4' />
                Login to Admin Panel
              </>
            ) : isRegister ? (
              <>
                <UserPlus className='w-4 h-4' />
                Create Account
              </>
            ) : (
              <>
                <LogIn className='w-4 h-4' />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* User Sign In / Register toggle footer */}
        {activeTab === 'user' && (
          <div className='mt-6 text-center text-xs text-gray-400'>
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type='button'
                  onClick={() => setIsRegister(false)}
                  className='text-primary hover:underline font-medium cursor-pointer ml-1'
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type='button'
                  onClick={() => setIsRegister(true)}
                  className='text-primary hover:underline font-medium cursor-pointer ml-1'
                >
                  Register
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthModal
