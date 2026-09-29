const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

const router = express.Router();

// Register: POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role, theatreName, city, location, screenName, totalSeats } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = store.findUserByEmail(email);
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
      email: email.trim().toLowerCase(),
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
