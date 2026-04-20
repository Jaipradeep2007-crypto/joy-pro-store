// routes/payments.js
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: orderId
    });
    
    // Update order with Razorpay order ID
    await Order.findOneAndUpdate(
      { orderId, userId: req.user._id },
      { 'payment.gatewayOrderId': razorpayOrder.id }
    );
    
    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;
    
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    
    if (expectedSignature === razorpay_signature) {
      // Payment successful
      await Order.findOneAndUpdate(
        { orderId, userId: req.user._id },
        {
          'payment.status': 'paid',
          'payment.razorpayPaymentId': razorpay_payment_id,
          $push: {
            timeline: {
              status: 'payment_confirmed',
              timestamp: new Date(),
              note: 'Payment confirmed'
            }
          }
        }
      );
      
      res.json({ success: true });
    } else {
      // Payment failed
      await Order.findOneAndUpdate(
        { orderId, userId: req.user._id },
        { 'payment.status': 'failed' }
      );
      
      res.status(400).json({ error: 'Payment verification failed' });
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Payment verification error' });
  }
});

module.exports = router;
