const express = require('express');
const store = require('../data/store');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean();
    if (users && users.length > 0) {
      return res.json({
        success: true,
        users,
        count: users.length,
      });
    }
  } catch (err) {
    // Fallback to store
  }

  try {
    const users = store.getAllUsers();
    return res.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
});

module.exports = router;
