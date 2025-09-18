// backend/src/models/Station.js
const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  placeId: String,
  name: String,
  address: String,
  location: { lat: Number, lng: Number },
  provider: String, // e.g., 'google', 'osm'
  meta: Object
}, { timestamps: true });

module.exports = mongoose.model('Station', StationSchema);
