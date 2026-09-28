const express = require('express');
const store = require('../data/store');

const router = express.Router();

// GET /api/theatres
router.get('/theatres', (req, res) => {
  const theatres = store.getTheatres();
  return res.json({
    success: true,
    theatres,
  });
});

// GET /api/screens
router.get('/screens', (req, res) => {
  const screens = store.getScreens();
  return res.json({
    success: true,
    screens,
  });
});

module.exports = router;
