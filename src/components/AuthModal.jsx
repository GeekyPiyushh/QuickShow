import React, { useState, useEffect } from 'react'
import { X, User, ShieldCheck, Mail, Lock, UserPlus, LogIn, Building2, MapPin, Tv, Armchair, KeyRound, ArrowLeft, RotateCw } from 'lucide-react'
import { login, register, sendOtp } from '../lib/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('user') // 'user' | 'admin'
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  // OTP Step for Registration
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [devOtpHint, setDevOtpHint] = useState('')

  // User & Admin core credentials
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Extended Admin & Theatre fields
  const [theatreName, setTheatreName] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [screenName, setScreenName] = useState('Screen 1 (Dolby Atmos)')
  const [totalSeats, setTotalSeats] = useState('90')

  const navigate = useNavigate()

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  if (!isOpen) return null

  const handleFillDemoUser = () => {
    setEmail('piyush@example.com')
    setPassword('password123')
    setIsRegister(false)
    setOtpStep(false)
  }

  const handleFillDemoAdmin = () => {
    setEmail('admin@example.com')
    setPassword('admin123')
    setIsRegister(false)
    setOtpStep(false)
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setOtp('')
    setOtpStep(false)
    setDevOtpHint('')
    setResendCooldown(0)
    setTheatreName('')
    setCity('')
    setLocation('')
    setScreenName('Screen 1 (Dolby Atmos)')
    setTotalSeats('90')
  }

  // Step 1 Submit: For Login OR Sending OTP for Registration
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      return toast.error('Please enter both email and password.')
    }

    // Login Flow
    if (!isRegister) {
      setLoading(true)
      try {
        const res = await login(email.trim(), password)
        if (res && res.success) {
          if (activeTab === 'admin' && res.user.role !== 'admin') {
            toast.error('This account does not have administrator privileges.')
            setLoading(false)
            return
          }

          toast.success(`Welcome back, ${res.user.name}!`)
          if (onAuthSuccess) onAuthSuccess(res.user)
          onClose()

          if (activeTab === 'admin' || res.user.role === 'admin') {
            navigate('/admin')
          }
        } else {
          toast.error(res?.message || 'Invalid email or password.')
        }
      } catch (err) {
        toast.error(err.message || 'Authentication failed. Please check your backend connection.')
      } finally {
        setLoading(false)
      }
      return
    }

    // Registration Flow - Step 1: Send OTP
    if (!name.trim()) {
      return toast.error('Please enter your full name.')
    }

    if (activeTab === 'admin') {
      if (!theatreName.trim()) {
        return toast.error('Please enter your Theatre / Cinema name.')
      }
      if (!city.trim()) {
        return toast.error('Please enter the City.')
      }
    }

    setLoading(true)
    try {
      const res = await sendOtp(email.trim(), 'register')
      if (res && res.success) {
        toast.success(res.message || 'Verification code sent!')
        setOtpStep(true)
        setResendCooldown(30)
        if (res.devOtp) {
          setDevOtpHint(res.devOtp)
        }
      } else {
        toast.error(res?.message || 'Failed to send verification code.')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to connect to backend server.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return
    setLoading(true)
    try {
      const res = await sendOtp(email.trim(), 'register')
      if (res && res.success) {
        toast.success('New verification code sent!')
        setResendCooldown(30)
        if (res.devOtp) {
          setDevOtpHint(res.devOtp)
        }
      } else {
        toast.error(res?.message || 'Failed to resend OTP.')
      }
    } catch (err) {
      toast.error('Error connecting to email service.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault()

    if (!otp || otp.trim().length < 6) {
      return toast.error('Please enter the 6-digit verification code.')
    }

    setLoading(true)
    try {
      const extraData = activeTab === 'admin' ? {
        role: 'admin',
        theatreName: theatreName.trim(),
        city: city.trim(),
        location: location.trim(),
        screenName: screenName.trim(),
        totalSeats: Number(totalSeats) || 90,
      } : {
        role: 'user',
      }

      const res = await register(name.trim(), email.trim(), password, extraData, otp.trim())
      if (res && res.success) {
        if (activeTab === 'admin') {
          toast.success(`🎉 Cinema "${theatreName}" and Admin account registered successfully!`)
        } else {
          toast.success('Registration successful! Welcome to QuickShow.')
        }

        if (onAuthSuccess && res.user) onAuthSuccess(res.user)
        resetForm()
        onClose()

        if (activeTab === 'admin' || res.user?.role === 'admin') {
          navigate('/admin')
        }
      } else {
        toast.error(res?.message || 'Registration failed. Check OTP code.')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
      <div className='relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-stone-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-200 scrollbar-thin scrollbar-thumb-white/10'>
        
        {/* Close Button */}
        <button
          onClick={() => {
            resetForm()
            onClose()
          }}
          className='absolute top-5 right-5 text-gray-400 hover:text-white transition cursor-pointer'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Modal Header */}
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2'>
            {otpStep ? (
              <>
                <KeyRound className='w-6 h-6 text-primary' />
                <span>Verify Your Email</span>
              </>
            ) : activeTab === 'admin' ? (
              isRegister ? (
                <>
                  <Building2 className='w-6 h-6 text-amber-400' />
                  <span>Register Cinema & Admin</span>
                </>
              ) : (
                <>
                  <ShieldCheck className='w-6 h-6 text-amber-400' />
                  <span>Admin Portal</span>
                </>
              )
            ) : (
              isRegister ? 'Create Account' : 'Welcome Back'
            )}
          </h2>
          <p className='text-xs sm:text-sm text-gray-400 mt-1'>
            {otpStep ? (
              <span>We've sent a 6-digit verification code to <strong className='text-white'>{email}</strong></span>
            ) : activeTab === 'admin'
              ? (isRegister
                  ? 'Register your cinema hall, address & screens to start managing shows'
                  : 'Sign in to access cinema dashboard and scheduling')
              : (isRegister
                  ? 'Join QuickShow to book movie tickets with ease'
                  : 'Sign in to manage and view your bookings')}
          </p>
        </div>

        {/* Role Selector Tabs (Only on Step 1) */}
        {!otpStep && (
          <div className='grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl mb-5 border border-white/5'>
            <button
              type='button'
              onClick={() => {
                setActiveTab('user')
                setIsRegister(false)
                resetForm()
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
                resetForm()
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'admin' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className='w-4 h-4' />
              Admin / Cinema Partner
            </button>
          </div>
        )}

        {/* Quick Demo Fill Buttons (Only visible in Sign In mode) */}
        {!isRegister && !otpStep && (
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
        )}

        {/* ============================================================ */}
        {/* STEP 2: OTP VERIFICATION VIEW */}
        {/* ============================================================ */}
        {otpStep ? (
          <form onSubmit={handleVerifyAndRegister} className='space-y-4 animate-in fade-in slide-in-from-right-4 duration-200'>
            
            {/* Dev Mode Banner (If SMTP is not configured or in fallback mode) */}
            {devOtpHint && (
              <div className='bg-primary/10 border border-primary/30 rounded-xl p-3 text-center text-xs text-rose-300'>
                <span className='font-medium'>Dev Mode Code:</span>{' '}
                <code className='font-mono font-bold bg-black/60 px-2 py-0.5 rounded text-white tracking-widest text-sm'>{devOtpHint}</code>
                <button
                  type='button'
                  onClick={() => setOtp(devOtpHint)}
                  className='ml-2.5 text-primary hover:underline font-semibold cursor-pointer'
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className='block text-xs font-medium text-gray-300 mb-2 text-center'>
                Enter 6-Digit OTP Code
              </label>
              <div className='flex items-center justify-center'>
                <input
                  type='text'
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder='••••••'
                  className='w-full text-center text-2xl font-mono tracking-[0.5em] py-3.5 bg-black/60 border border-white/15 rounded-xl text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition'
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Countdown / Resend Option */}
            <div className='flex items-center justify-between text-xs text-gray-400 px-1 pt-1'>
              <button
                type='button'
                onClick={() => setOtpStep(false)}
                className='inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition cursor-pointer'
              >
                <ArrowLeft className='w-3.5 h-3.5' /> Edit Email
              </button>

              {resendCooldown > 0 ? (
                <span className='text-gray-500'>Resend code in {resendCooldown}s</span>
              ) : (
                <button
                  type='button'
                  onClick={handleResendOtp}
                  disabled={loading}
                  className='inline-flex items-center gap-1 text-primary hover:text-primary-dull transition font-medium cursor-pointer'
                >
                  <RotateCw className='w-3 h-3' /> Resend OTP
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading || otp.length < 6}
              className={`w-full mt-3 py-3 text-white rounded-xl font-medium text-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
                activeTab === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20'
                  : 'bg-primary hover:bg-primary-dull shadow-lg shadow-primary/20'
              }`}
            >
              {loading ? (
                <span>Verifying & Creating Account...</span>
              ) : (
                <>
                  <KeyRound className='w-4 h-4' />
                  Verify & Complete Registration
                </>
              )}
            </button>
          </form>
        ) : (
          /* ============================================================ */
          /* STEP 1: LOGIN & REGISTRATION DETAILS VIEW */
          /* ============================================================ */
          <form onSubmit={handleSubmit} className='space-y-4'>
            
            {/* Full Name (if registering) */}
            {isRegister && (
              <div>
                <label className='block text-xs font-medium text-gray-300 mb-1.5'>
                  {activeTab === 'admin' ? 'Administrator / Partner Name' : 'Full Name'}
                </label>
                <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-primary transition'>
                  <User className='w-4 h-4 text-gray-400 mr-2.5 shrink-0' />
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={activeTab === 'admin' ? 'e.g. Piyush Tehalani (Theatre Owner)' : 'e.g. John Doe'}
                    className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className='block text-xs font-medium text-gray-300 mb-1.5'>
                {activeTab === 'admin' ? 'Admin Work Email' : 'Email Address'}
              </label>
              <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-primary transition'>
                <Mail className='w-4 h-4 text-gray-400 mr-2.5 shrink-0' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'cinema.admin@example.com' : 'you@example.com'}
                  className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                  required
                />
              </div>
            </div>

            {/* Password */}
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

            {/* ============================================================ */}
            {/* EXTENDED SECTION: THEATRE & CINEMA DETAILS (FOR ADMIN REGISTER) */}
            {/* ============================================================ */}
            {activeTab === 'admin' && isRegister && (
              <div className='pt-3 pb-1 border-t border-white/10 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300'>
                
                <div className='flex items-center gap-2'>
                  <span className='inline-flex items-center justify-center p-1 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold'>
                    <Building2 className='w-3.5 h-3.5 mr-1' /> Cinema Registration
                  </span>
                  <span className='text-[11px] text-gray-400'>Enter your theatre details</span>
                </div>

                {/* Theatre Name */}
                <div>
                  <label className='block text-xs font-medium text-gray-300 mb-1.5'>
                    Theatre / Cinema Name <span className='text-rose-500'>*</span>
                  </label>
                  <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-amber-500 transition'>
                    <Building2 className='w-4 h-4 text-amber-400 mr-2.5 shrink-0' />
                    <input
                      type='text'
                      value={theatreName}
                      onChange={(e) => setTheatreName(e.target.value)}
                      placeholder='e.g. QuickShow Grand Multiplex'
                      className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                      required
                    />
                  </div>
                </div>

                {/* City & Location Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-300 mb-1.5'>
                      City <span className='text-rose-500'>*</span>
                    </label>
                    <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-amber-500 transition'>
                      <MapPin className='w-4 h-4 text-gray-400 mr-2 shrink-0' />
                      <input
                        type='text'
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder='e.g. Mumbai / Delhi'
                        className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-300 mb-1.5'>Mall / Address Location</label>
                    <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-amber-500 transition'>
                      <MapPin className='w-4 h-4 text-gray-400 mr-2 shrink-0' />
                      <input
                        type='text'
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder='e.g. Phoenix Mall, 4th Floor'
                        className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Screen & Capacity Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-300 mb-1.5'>Primary Screen / Audi Name</label>
                    <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-amber-500 transition'>
                      <Tv className='w-4 h-4 text-gray-400 mr-2 shrink-0' />
                      <input
                        type='text'
                        value={screenName}
                        onChange={(e) => setScreenName(e.target.value)}
                        placeholder='e.g. Screen 1 (Dolby Atmos)'
                        className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-300 mb-1.5'>Seating Capacity</label>
                    <div className='flex items-center bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-amber-500 transition'>
                      <Armchair className='w-4 h-4 text-gray-400 mr-2 shrink-0' />
                      <input
                        type='number'
                        min='20'
                        max='500'
                        value={totalSeats}
                        onChange={(e) => setTotalSeats(e.target.value)}
                        placeholder='90'
                        className='bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full'
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className={`w-full mt-3 py-3 text-white rounded-xl font-medium text-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
                activeTab === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20'
                  : 'bg-primary hover:bg-primary-dull'
              }`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : activeTab === 'admin' ? (
                isRegister ? (
                  <>
                    <KeyRound className='w-4 h-4' />
                    Send Verification OTP
                  </>
                ) : (
                  <>
                    <LogIn className='w-4 h-4' />
                    Login to Admin Panel
                  </>
                )
              ) : isRegister ? (
                <>
                  <KeyRound className='w-4 h-4' />
                  Send Verification OTP
                </>
              ) : (
                <>
                  <LogIn className='w-4 h-4' />
                  Sign In
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom Toggle Footer */}
        {!otpStep && (
          <div className='mt-6 text-center text-xs text-gray-400 border-t border-white/5 pt-4'>
            {activeTab === 'admin' ? (
              isRegister ? (
                <p>
                  Already have an Admin account?{' '}
                  <button
                    type='button'
                    onClick={() => {
                      setIsRegister(false)
                      setOtpStep(false)
                    }}
                    className='text-amber-400 hover:underline font-medium cursor-pointer ml-1'
                  >
                    Admin Sign In
                  </button>
                </p>
              ) : (
                <p>
                  New Cinema Partner?{' '}
                  <button
                    type='button'
                    onClick={() => {
                      setIsRegister(true)
                      setOtpStep(false)
                    }}
                    className='text-amber-400 hover:underline font-medium cursor-pointer ml-1'
                  >
                    Register your Theatre & Admin
                  </button>
                </p>
              )
            ) : (
              isRegister ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type='button'
                    onClick={() => {
                      setIsRegister(false)
                      setOtpStep(false)
                    }}
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
                    onClick={() => {
                      setIsRegister(true)
                      setOtpStep(false)
                    }}
                    className='text-primary hover:underline font-medium cursor-pointer ml-1'
                  >
                    Register
                  </button>
                </p>
              )
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default AuthModal
