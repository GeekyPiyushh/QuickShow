const express = require('express');
const store = require('../data/store');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/bookings/my (Logged-in user bookings)
router.get('/my', authenticate, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const userBookings = await Booking.find({
      $or: [
        { userId: req.user._id },
        { 'user._id': req.user._id },
        { 'user.email': req.user.email?.toLowerCase() },
      ]
    }).sort({ createdAt: -1 }).lean();

    if (userBookings && userBookings.length > 0) {
      return res.json({
        success: true,
        bookings: userBookings,
      });
    }
  } catch (err) {
    // Fallback to store
  }

  try {
    const userBookings = store.getUserBookings(req.user._id);
    return res.json({
      success: true,
      bookings: userBookings,
    });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
});

// GET /api/bookings (Admin only - all bookings)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const allBookings = await Booking.find().sort({ createdAt: -1 }).lean();
    if (allBookings && allBookings.length > 0) {
      return res.json({
        success: true,
        bookings: allBookings,
      });
    }
  } catch (err) {
    // Fallback to store
  }

  try {
    const allBookings = store.getAllBookings();
    return res.json({
      success: true,
      bookings: allBookings,
    });
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
});

// POST /api/bookings (Create new booking)
router.post('/', authenticate, (req, res) => {
  try {
    const { show, seats } = req.body;
    if (!show || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Show and seats array are required',
      });
    }

    const showObj = typeof show === 'object' ? show : store.getShowById(show);
    const unitPrice = showObj?.price ?? showObj?.showPrice ?? 200;
    const totalAmount = unitPrice * seats.length;

    const newBooking = store.createBooking({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      userId: req.user._id,
      show: showObj || { _id: show, movie: { title: 'Movie' } },
      seats: seats.map(s => (typeof s === 'object' ? s : { seatNumber: s })),
      bookedSeats: seats.map(s => (typeof s === 'object' ? s.seatNumber : s)),
      totalAmount,
      amount: totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking,
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
    });
  }
});

module.exports = router;
