const express = require('express');
const store = require('../data/store');

const router = express.Router();

// GET /api/theatres
router.get('/theatres', async (req, res) => {
  try {
    const Theatre = require('../models/Theatre');
    const theatres = await Theatre.find().lean();
    if (theatres && theatres.length > 0) {
      return res.json({
        success: true,
        theatres,
      });
    }
  } catch (err) {
    // Fallback to in-memory store
  }
  const theatres = store.getTheatres();
  return res.json({
    success: true,
    theatres,
  });
});

// GET /api/screens
router.get('/screens', async (req, res) => {
  try {
    const Screen = require('../models/Screen');
    const screens = await Screen.find().lean();
    if (screens && screens.length > 0) {
      return res.json({
        success: true,
        screens,
      });
    }
  } catch (err) {
    // Fallback to in-memory store
  }
  const screens = store.getScreens();
  return res.json({
    success: true,
    screens,
  });
});

module.exports = router;
