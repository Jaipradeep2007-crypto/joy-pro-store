// services/smsService.js
const axios = require('axios');

class SMSService {
  constructor() {
    // Using MSG91 (popular in India)
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.baseUrl = '[api.msg91.com](https://api.msg91.com/api/v5)';
  }

  async sendOTP(phone, otp) {
    try {
      const response = await axios.post(`${this.baseUrl}/otp`, {
        template_id: process.env.MSG91_OTP_TEMPLATE_ID,
        mobile: `91${phone}`,
        authkey: this.apiKey,
        otp: otp
      });

      return response.data;
    } catch (error) {
      console.error('SMS OTP Error:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOTP(phone, otp) {
    try {
      const response = await axios.get(`${this.baseUrl}/otp/verify`, {
        params: {
          authkey: this.apiKey,
          mobile: `91${phone}`,
          otp: otp
        }
      });

      return response.data.type === 'success';
    } catch (error) {
      console.error('OTP Verification Error:', error);
      return false;
    }
  }

  async sendOrderUpdate(phone, orderId, status) {
    const messages = {
      confirmed: `Hi! Your JOY PRO order ${orderId} is confirmed. We'll notify you when it ships. Track: joyproindia.com/track/${orderId}`,
      shipped: `🚚 Your JOY PRO order ${orderId} has shipped! Expected delivery in 3-5 days. Track: joyproindia.com/track/${orderId}`,
      delivered: `📦 Your JOY PRO order ${orderId} is delivered! Hope you love your premium caps. Rate us: joyproindia.com/review/${orderId}`
    };

    try {
      await axios.post(`${this.baseUrl}/flow`, {
        flow_id: process.env.MSG91_ORDER_FLOW_ID,
        sender: this.senderId,
        mobiles: `91${phone}`,
        authkey: this.apiKey,
        message: messages[status] || messages.confirmed
      });
    } catch (error) {
      console.error('SMS Error:', error);
    }
  }
}

module.exports = new SMSService();
