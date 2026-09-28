const express = require('express');
const store = require('../data/store');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users (Admin only)
router.get('/', authenticate, requireAdmin, (req, res) => {
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
