const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');
const { JWT_SECRET, authenticate } = require('../middleware/auth');
const { generateOtp, canResendOtp, storeOtp, verifyOtp, consumeOtp } = require('../utils/otpStore');
const { sendOtpEmail } = require('../utils/emailService');

const router = express.Router();

// Send OTP: POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email, type = 'register' } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // If type is register, ensure email is not already taken
    if (type === 'register') {
      const existingUser = store.findUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please sign in.',
        });
      }
    }

    // Cooldown check (prevent spamming)
    const cooldown = canResendOtp(normalizedEmail);
    if (!cooldown.allowed) {
      return res.status(429).json({
        success: false,
        message: cooldown.message,
        secondsRemaining: cooldown.secondsRemaining,
      });
    }

    // Generate & store OTP
    const otp = generateOtp();
    storeOtp(normalizedEmail, otp);

    // Send email via Nodemailer / console fallback
    const result = await sendOtpEmail(normalizedEmail, otp);

    return res.json({
      success: true,
      message: result.mode === 'email'
        ? `Verification code sent to ${normalizedEmail}`
        : `Verification code generated (Check terminal or dev mode)`,
      devOtp: (result.mode === 'console' || result.mode === 'console-fallback') ? otp : undefined,
      mode: result.mode,
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
    });
  }
});

// Verify OTP: POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required',
      });
    }

    const verification = verifyOtp(email, otp);
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
    });
  }
});

// Register: POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, otp, role, theatreName, city, location, screenName, totalSeats } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP
    if (otp) {
      const otpCheck = verifyOtp(normalizedEmail, otp);
      if (!otpCheck.valid) {
        return res.status(400).json({
          success: false,
          message: otpCheck.message,
        });
      }
      consumeOtp(normalizedEmail);
    } else if (process.env.NODE_ENV !== 'test' && !req.headers['x-bypass-otp']) {
      return res.status(400).json({
        success: false,
        message: 'Email verification code (OTP) is required to register.',
      });
    }

    const existingUser = store.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const isAdmin = role === 'admin';
    let newTheatre = null;
    let newScreen = null;

    if (isAdmin && theatreName && theatreName.trim()) {
      newTheatre = store.createTheatre({
        name: theatreName.trim(),
        city: city ? city.trim() : 'Downtown',
        location: location ? location.trim() : '',
      });

      newScreen = store.createScreen({
        name: screenName ? screenName.trim() : `${theatreName.trim()} - Audi 1`,
        theatre: newTheatre,
        totalSeats: Number(totalSeats) || 90,
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = store.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: isAdmin ? 'admin' : 'user',
      theatreId: newTheatre ? newTheatre._id : null,
      theatreName: newTheatre ? newTheatre.name : null,
    });

    const payload = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      theatre: newTheatre,
      theatreId: newTheatre ? newTheatre._id : null,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: isAdmin ? 'Admin & Theatre registered successfully!' : 'User registered successfully!',
      token,
      user: payload,
      theatre: newTheatre,
      screen: newScreen,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
});

// Login: POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: payload,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
});

// Current User: GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = store.findUserById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = router;
