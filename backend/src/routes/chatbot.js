// backend/src/routes/chatbot.js
const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const FuelEntry = require('../models/FuelEntry');
const authMiddleware = require('../../utils/authMiddleware');

router.post('/message', async (req, res) => {
  const { text, lat, lng } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  let user = null;

  // Try to get user if token provided
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/User');
      user = await User.findById(decoded.id);
    } catch (err) {
      // Continue without user context
    }
  }

  const t = text.toLowerCase();

  // Station search intent
  if (t.includes('near') && (t.includes('gas') || t.includes('station') || t.includes('petrol') || t.includes('fuel') || t.includes('pump'))) {
    if (!lat || !lng) {
      return res.json({ 
        reply: 'I need your location to find nearby petrol pumps. Please enable location sharing and try again!',
        needsLocation: true
      });
    }
    
    try {
      // Create a mock request object for the station controller
      const mockReq = { query: { lat, lng, radius: 5000 } };
      const mockRes = {
        json: (data) => {
          if (data.success && data.stations && data.stations.length > 0) {
            const stationList = data.stations.slice(0, 5).map((station, index) => 
              `${index + 1}. ${station.name} (${station.brand})\n   📍 ${station.address}\n   📏 ${station.distance ? `${station.distance}m away` : 'Distance unknown'}\n   🗺️ View: ${station.googleMapsUrl}`
            ).join('\n\n');
            
            return res.json({
              reply: `🛣️ Found ${data.stations.length} petrol pumps near you:\n\n${stationList}\n\n💡 Tip: Click on any station in the "Add Fuel Entry" tab to auto-fill the form!`,
              stations: data.stations,
              hasStations: true
            });
          } else {
            return res.json({
              reply: '😔 Sorry, I couldn\'t find any petrol pumps near your location. This might be because:\n\n• You\'re in a remote area\n• The mapping data is incomplete\n• Try expanding your search radius\n\nYou can still manually add fuel entries in the "Add Fuel Entry" tab!'
            });
          }
        },
        status: () => mockRes
      };
      
      await stationController.findNearby(mockReq, mockRes);
    } catch (error) {
      return res.json({
        reply: '⚠️ There was an error searching for petrol pumps. Please try again or add fuel entries manually.'
      });
    }
    return; // Important: prevent further processing
  }

  // Expense stats intent
  if ((t.includes('how much') || t.includes('total')) && (t.includes('spent') || t.includes('cost') || t.includes('expense'))) {
    if (!user) return res.json({ reply: 'Please login to view your expense statistics.' });
    
    try {
      const thisMonth = new Date();
      const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
      
      const monthlyExpenses = await FuelEntry.find({
        user: user._id,
        date: { $gte: startOfMonth }
      });
      
      const totalSpent = monthlyExpenses.reduce((sum, entry) => sum + entry.totalCost, 0);
      const totalLiters = monthlyExpenses.reduce((sum, entry) => sum + entry.liters, 0);
      
      return res.json({ 
        reply: `This month you've spent ₹${totalSpent.toFixed(2)} on ${totalLiters.toFixed(1)} liters of fuel across ${monthlyExpenses.length} fill-ups.` 
      });
    } catch (err) {
      return res.json({ reply: 'Sorry, I couldn\'t retrieve your expense data right now.' });
    }
  }

  // Average price intent
  if (t.includes('average') && (t.includes('price') || t.includes('cost'))) {
    if (!user) return res.json({ reply: 'Please login to view your fuel price statistics.' });
    
    try {
      const recentEntries = await FuelEntry.find({ user: user._id }).sort({ date: -1 }).limit(10);
      if (recentEntries.length === 0) {
        return res.json({ reply: 'You haven\'t recorded any fuel entries yet. Add some entries to see your average price!' });
      }
      
      const avgPrice = recentEntries.reduce((sum, entry) => sum + entry.pricePerLiter, 0) / recentEntries.length;
      return res.json({ 
        reply: `Your average fuel price over the last ${recentEntries.length} fill-ups is ₹${avgPrice.toFixed(2)} per liter.` 
      });
    } catch (err) {
      return res.json({ reply: 'Sorry, I couldn\'t calculate your average price right now.' });
    }
  }

  // Last fill-up intent
  if (t.includes('last') && (t.includes('fill') || t.includes('fuel') || t.includes('entry'))) {
    if (!user) return res.json({ reply: 'Please login to view your fuel entries.' });
    
    try {
      const lastEntry = await FuelEntry.findOne({ user: user._id }).sort({ date: -1 });
      if (!lastEntry) {
        return res.json({ reply: 'You haven\'t recorded any fuel entries yet!' });
      }
      
      const daysAgo = Math.floor((new Date() - lastEntry.date) / (1000 * 60 * 60 * 24));
      return res.json({ 
        reply: `Your last fill-up was ${daysAgo} days ago at ${lastEntry.stationName || 'Unknown Station'} - ${lastEntry.liters}L for ₹${lastEntry.totalCost}.` 
      });
    } catch (err) {
      return res.json({ reply: 'Sorry, I couldn\'t retrieve your last entry.' });
    }
  }

  // Help intent
  if (t.includes('help') || t.includes('what can you do')) {
    return res.json({ 
      reply: `I can help you with:
• Find nearby gas stations (say "find gas stations near me")
• Check your monthly expenses (say "how much have I spent")
• Get your average fuel price (say "what's my average price")
• View your last fill-up (say "when was my last fill-up")
• General fuel tracking assistance

Just ask me anything about your fuel expenses!` 
    });
  }

  // Default response with suggestions
  const suggestions = [
    "Try asking: 'Find gas stations near me'",
    "Ask: 'How much have I spent this month?'",
    "Say: 'What's my average fuel price?'",
    "Ask: 'When was my last fill-up?'",
    "Type 'help' to see all commands"
  ];
  
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  
  res.json({ 
    reply: `I'm here to help with your fuel tracking! ${randomSuggestion}` 
  });
});

module.exports = router;
