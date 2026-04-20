// routes/orders.js
const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Order
router.post('/create', auth, async (req, res) => {
  try {
    const { items, shipping, payment } = req.body;
    
    // Generate unique order ID
    const orderId = 'JP-' + Date.now().toString(36).toUpperCase();
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping_cost = subtotal >= 999 ? 0 : 49;
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + shipping_cost + gst;
    
    const order = new Order({
      orderId,
      userId: req.user._id,
      items,
      shipping,
      payment: {
        ...payment,
        amount: total,
        status: 'pending'
      },
      status: 'confirmed',
      timeline: [
        {
          status: 'confirmed',
          timestamp: new Date(),
          note: 'Order confirmed'
        }
      ]
    });
    
    await order.save();
    
    res.status(201).json({
      success: true,
      orderId,
      order
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get User Orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get Order Details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user._id
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
