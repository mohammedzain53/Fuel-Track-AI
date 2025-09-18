// backend/src/controllers/stationController.js
const places = require('../services/placesService');

exports.findNearby = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if(!lat || !lng) return res.status(400).json({ error: 'lat & lng required' });

    if (process.env.PLACES_PROVIDER === 'google') {
      const data = await places.googleNearby(lat, lng, radius || 5000, 'gas_station', process.env.GOOGLE_PLACES_API_KEY);
      return res.json({ provider: 'google', data });
    } else {
      const data = await places.osmNearby(lat, lng, radius || 5000);
      return res.json({ provider: 'osm', data });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
};
