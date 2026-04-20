// routes/admin.js
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Get All Orders (Admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update Order Status
router.put('/orders/:orderId/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;
    
    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        status,
        $push: {
          timeline: {
            status,
            timestamp: new Date(),
            note: `Status updated to ${status}`
          }
        }
      },
      { new: true }
    );
    
    // Send email notification
    await sendOrderStatusEmail(order);
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
