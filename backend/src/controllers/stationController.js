// backend/src/controllers/stationController.js
const places = require('../services/placeService');

exports.findNearby = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Use smaller default radius for more accurate local results
    const searchRadius = parseInt(radius) || 3000; // Reduced from 5000m to 3000m (3km)
    
    console.log(`Station search request: ${lat}, ${lng} within ${searchRadius}m`);
    let data;
    let provider;

    // Try Google Places first if API key is configured
    if (process.env.PLACES_PROVIDER === 'google' && 
        process.env.GOOGLE_PLACES_API_KEY && 
        process.env.GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_KEY') {
      try {
        data = await places.googleNearby(lat, lng, searchRadius, 'gas_station', process.env.GOOGLE_PLACES_API_KEY);
        provider = 'google';
      } catch (googleError) {
        console.log('Google Places API failed, falling back to OSM:', googleError.message);
        data = await places.osmNearby(lat, lng, searchRadius);
        provider = 'osm';
      }
    } else {
      // Use OpenStreetMap by default (free)
      data = await places.osmNearby(lat, lng, searchRadius);
      provider = 'osm';
    }

    // Format response consistently
    let stations = [];
    
    if (provider === 'google' && data.results) {
      stations = data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        brand: place.name,
        address: place.vicinity || place.formatted_address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating,
        isOpen: place.opening_hours?.open_now,
        provider: 'google'
      }));
    } else if (provider === 'osm' && data.elements) {
      stations = data.elements.map(element => ({
        id: element.id,
        name: element.name,
        brand: element.brand,
        address: element.address,
        lat: element.lat,
        lng: element.lon,
        distance: element.distance,
        operator: element.operator,
        openingHours: element.openingHours,
        fuelTypes: element.fuel_types,
        googleMapsUrl: element.googleMapsUrl,
        googleMapsDirectionsUrl: element.googleMapsDirectionsUrl,
        coordinates: element.coordinates,
        provider: 'osm'
      }));
    }

    res.json({
      success: true,
      provider,
      count: stations.length,
      stations,
      searchRadius,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });

  } catch (err) {
    console.error('Station search error:', err);
    res.status(500).json({ 
      error: 'Failed to find nearby stations',
      details: err.message 
    });
  }
};
