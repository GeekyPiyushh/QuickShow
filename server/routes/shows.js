const express = require('express');
const store = require('../data/store');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

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
  }
  const shows = store.getShows();
  return res.json({
    success: true,
    shows,
  });
});

router.get('/:id/seats', async (req, res) => {
  try {
    const Show = require('../models/Show');
    const mongoose = require('mongoose');
    const id = req.params.id;
    let objId = null;
    try {
      if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
        objId = new mongoose.Types.ObjectId(id);
      }
    } catch (_) {}

    const conditions = [
      { _id: id },
      { id: id },
      ...(objId ? [{ _id: objId }] : []),
    ];

    const show = await Show.findOne({ $or: conditions }).lean();
    if (show) {
      return res.json({
        success: true,
        show,
        bookedSeats: show.bookedSeats || [],
      });
    }
  } catch (err) {
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
