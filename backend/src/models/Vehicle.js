// backend/src/models/Vehicle.js
const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  model: String,
  fuelType: { type: String, enum: ['petrol','diesel','electric','cng'], default: 'petrol' }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
