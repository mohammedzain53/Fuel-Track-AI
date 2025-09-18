// backend/src/routes/chatbot.js
const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

router.post('/message', async (req, res) => {
  const { text, lat, lng } = req.body;

  // simple intent detection (naive)
  const t = text.toLowerCase();
  if (t.includes('near') && (t.includes('gas') || t.includes('station') || t.includes('petrol') || t.includes('diesel'))) {
    // require lat/lng to be provided from frontend (browser geolocation)
    if (!lat || !lng) return res.json({ reply: 'Please share your location so I can find nearby gas stations.' });
    // call the station controller logic
    req.query = { lat, lng, radius: 5000 }; // hack to reuse
    return stationController.findNearby(req, res);
  }

  // example: user asks expense stats
  if (t.includes('how much') && t.includes('spent')) {
    // compute total cost for user quickly (requires auth); but for simplicity return canned
    return res.json({ reply: `You have spent ₹XXX this month. (connect to /api/fuel/stats for real data)` });
  }

  // default
  return res.json({ reply: "I can find nearby gas stations (say 'find gas stations' and share your location), or provide fuel stats." });
});

module.exports = router;
