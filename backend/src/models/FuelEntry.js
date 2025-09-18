// backend/src/models/FuelEntry.js
const mongoose = require('mongoose');

const FuelEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  date: { type: Date, default: Date.now },
  stationName: String,
  stationPlaceId: String, // optional (if from Places API)
  liters: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  fuelType: { 
    type: String, 
    enum: ['petrol', 'diesel', 'cng', 'electric'], 
    default: 'petrol' 
  },
  odometer: Number,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('FuelEntry', FuelEntrySchema);
