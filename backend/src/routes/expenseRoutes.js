const express = require('express');
const router = express.Router();

// @route   GET /api/expenses
// @desc    Test route
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Fuel expenses API works 🚀' });
});

module.exports = router;
