// models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  sizes: {
    'S/M': { type: Number, default: 0 },
    'M/L': { type: Number, default: 0 },
    'XL': { type: Number, default: 0 },
    'Free Size': { type: Number, default: 0 }
  },
  lowStockThreshold: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);
