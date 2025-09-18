// backend/src/services/placesService.js
const fetch = require('node-fetch');

const PROVIDER = process.env.PLACES_PROVIDER || 'google';

// example: google nearby search
async function googleNearby(lat, lng, radius=5000, type='gas_station', apiKey){
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
  const r = await fetch(url);
  return r.json();
}

// fallback to Nominatim / Overpass (OpenStreetMap) - example minimal
async function osmNearby(lat, lng, radius=5000){
  // use Overpass API query to find amenity=fuel
  const q = `[out:json];node(around:${radius},${lat},${lng})[amenity=fuel];out;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
  const r = await fetch(url);
  return r.json();
}

module.exports = { googleNearby, osmNearby };
