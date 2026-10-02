const express = require('express');
const store = require('../data/store');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/shows
router.get('/', async (req, res) => {
  try {
    const Show = require('../models/Show');
    const shows = await Show.find().lean();
    if (shows && shows.length > 0) {
      return res.json({
        success: true,
        shows,
      });
    }
  } catch (err) {
    // Fallback to in-memory store
  }
  const shows = store.getShows();
  return res.json({
    success: true,
    shows,
  });
});

// GET /api/shows/:id/seats
router.get('/:id/seats', async (req, res) => {
  try {
    const Show = require('../models/Show');
    const show = await Show.findOne({
      $or: [{ _id: req.params.id }, { id: req.params.id }]
    }).lean();
    if (show) {
      return res.json({
        success: true,
        show,
        bookedSeats: show.bookedSeats || [],
      });
    }
  } catch (err) {
    // Fallback to in-memory store
  }
  const show = store.getShowById(req.params.id);
  if (!show) {
    return res.status(404).json({
      success: false,
      message: 'Show not found',
    });
  }
  return res.json({
    success: true,
    show,
    bookedSeats: show.bookedSeats || [],
  });
});

// POST /api/shows (Admin only)
router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { movie, theatre, screen, showDate, startTime, endTime, price } = req.body;
    if (!movie || !showDate || !price) {
      return res.status(400).json({
        success: false,
        message: 'Movie, showDate, and price are required',
      });
    }

    const newShow = store.createShow({
      movie,
      theatre,
      screen,
      showDate,
      showDateTime: showDate,
      startTime: startTime || '10:00 AM',
      endTime: endTime || '12:00 PM',
      price: Number(price) || 200,
    });

    return res.status(201).json({
      success: true,
      message: 'Show created successfully',
      show: newShow,
    });
  } catch (err) {
    console.error('Error creating show:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create show',
    });
  }
});

module.exports = router;
