// backend/src/routes/stationRoutes.js
const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

// @route   GET /api/stations/nearby
// @desc    Find nearby gas stations
// @access  Public
router.get('/nearby', stationController.findNearby);

module.exports = router;