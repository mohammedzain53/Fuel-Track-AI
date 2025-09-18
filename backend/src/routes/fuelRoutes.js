// backend/src/routes/fuelRoutes.js
const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const authMiddleware = require('../../utils/authMiddleware');

// @route   POST /api/fuel
// @desc    Create new fuel entry
// @access  Private
router.post('/', authMiddleware, fuelController.createEntry);

// @route   GET /api/fuel
// @desc    Get fuel entries with optional filters
// @access  Private
router.get('/', authMiddleware, fuelController.getEntries);

// @route   GET /api/fuel/stats
// @desc    Get fuel statistics
// @access  Private
router.get('/stats', authMiddleware, fuelController.getStats);

// @route   GET /api/fuel/summary
// @desc    Get simple fuel summary
// @access  Private
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const entries = await require('../models/FuelEntry').find({ user: req.user.id });
    
    const summary = {
      totalEntries: entries.length,
      totalCost: entries.reduce((sum, entry) => sum + entry.totalCost, 0),
      totalLiters: entries.reduce((sum, entry) => sum + entry.liters, 0),
      avgPrice: entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.pricePerLiter, 0) / entries.length : 0,
      lastEntry: entries.length > 0 ? entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null
    };
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;