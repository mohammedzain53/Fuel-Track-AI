// backend/src/controllers/fuelController.js
const FuelEntry = require('../models/FuelEntry');

// create
exports.createEntry = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user.id }; // assume auth middleware sets req.user
    if(!payload.totalCost) payload.totalCost = payload.liters * payload.pricePerLiter;
    const entry = new FuelEntry(payload);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
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
    const userId = req.user.id;
    const agg = await FuelEntry.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $month: "$date", $year: { $year: "$date" } },
          totalCost: { $sum: "$totalCost" },
          totalLiters: { $sum: "$liters" },
          avgPrice: { $avg: "$pricePerLiter" }
        }
      },
      { $sort: { "_id.$year": -1, "_id.$month": -1 } },
      { $limit: 12 }
    ]);
    res.json(agg);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
