// routes/otp.js
const express = require('express');
const smsService = require('../services/smsService');
const router = express.Router();

// Generate and send OTP
router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Store OTP temporarily (use Redis in production)
    req.session.otpData = {
      phone,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    await smsService.sendOTP(phone, otp);
    
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const otpData = req.session.otpData;
    
    if (!otpData || otpData.phone !== phone || Date.now() > otpData.expiresAt) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }
    
    if (otpData.otp.toString() !== otp.toString()) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // Clear OTP data
    delete req.session.otpData;
    
    res.json({ success: true, verified: true });
  } catch (error) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

module.exports = router;
