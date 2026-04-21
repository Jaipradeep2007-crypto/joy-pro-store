// routes/inventory.js
const express = require('express');
const Inventory = require('../models/Inventory');
const adminAuth = require('../middleware/adminAuth');
const emailService = require('../services/emailService');
const router = express.Router();

// Get inventory status
router.get('/', adminAuth, async (req, res) => {
  try {
    const inventory = await Inventory.find({}).populate('productId');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Update stock levels
router.put('/:productId', adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { sizes } = req.body;
    
    const inventory = await Inventory.findOneAndUpdate(
      { productId },
      { sizes, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    
    // Check for low stock
    await checkLowStock(inventory);
    
    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// Reduce stock after order
async function reduceStock(productId, size, quantity) {
  try {
    const inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      throw new Error('Product not found in inventory');
    }
    
    if (inventory.sizes[size] < quantity) {
      throw new Error('Insufficient stock');
    }
    
    inventory.sizes[size] -= quantity;
    inventory.lastUpdated = new Date();
    await inventory.save();
    
    // Check low stock
    await checkLowStock(inventory);
    
  } catch (error) {
    throw error;
  }
}

async function checkLowStock(inventory) {
  const product = await Product.findOne({ productId: inventory.productId });
  
  for (const [size, stock] of Object.entries(inventory.sizes)) {
    if (stock <= inventory.lowStockThreshold) {
      // Send low stock alert to admin
      await emailService.sendLowStockAlert(product.name, size, stock);
      
      // Log to admin dashboard
      console.warn(`Low stock alert: ${product.name} - Size ${size} - ${stock} remaining`);
    }
  }
}

module.exports = { router, reduceStock };
