// backend/src/controllers/fuelController.js
const FuelEntry = require('../models/FuelEntry');

// create
exports.createEntry = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user.id };
    
    // Calculate total cost if not provided
    if(!payload.totalCost) payload.totalCost = payload.liters * payload.pricePerLiter;
    
    // Handle date - use provided date or current date
    if (payload.date) {
      payload.date = new Date(payload.date);
    } else {
      payload.date = new Date();
    }
    
    console.log('Creating fuel entry:', payload);
    
    const entry = new FuelEntry(payload);
    await entry.save();
    
    console.log('Fuel entry saved:', entry);
    res.status(201).json(entry);
  } catch (err) { 
    console.error('Error creating fuel entry:', err);
    res.status(500).json({ error: err.message }); 
  }
};

// read list with search/filter
exports.getEntries = async (req, res) => {
  try {
    const { q, startDate, endDate, vehicle } = req.query;
    const filter = { user: req.user.id };
    if (vehicle) filter.vehicle = vehicle;
    if (startDate || endDate) filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
    if (q) filter.$or = [
      { stationName: new RegExp(q, 'i') },
      { notes: new RegExp(q, 'i') }
    ];
    const entries = await FuelEntry.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// stats (monthly cost, avg price)
exports.getStats = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = req.user.id;
    
    console.log('Getting stats for user:', userId);
    
    // First, get all entries for the user
    const allEntries = await FuelEntry.find({ user: userId }).sort({ date: -1 });
    console.log('Found entries:', allEntries.length);
    
    if (allEntries.length === 0) {
      return res.json([]);
    }
    
    // Try the aggregation
    const agg = await FuelEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { 
            month: { $month: "$date" }, 
            year: { $year: "$date" } 
          },
          totalCost: { $sum: "$totalCost" },
          totalLiters: { $sum: "$liters" },
          avgPrice: { $avg: "$pricePerLiter" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);
    
    console.log('Aggregation result:', agg);
    res.json(agg);
  } catch (err) { 
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message }); 
  }
};
