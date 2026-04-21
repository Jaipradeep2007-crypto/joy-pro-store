// services/emailService.js
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // For production, use SendGrid
    // this.transporter = nodemailer.createTransporter({
    //   host: 'smtp.sendgrid.net',
    //   port: 587,
    //   auth: {
    //     user: 'apikey',
    //     pass: process.env.SENDGRID_API_KEY
    //   }
    // });
  }

  async sendOrderConfirmation(order, user) {
    try {
      const template = await this.loadTemplate('order-confirmation');
      
      const html = template({
        customerName: user.name,
        orderId: order.orderId,
        orderDate: new Date(order.createdAt).toLocaleDateString('en-IN'),
        items: order.items,
        subtotal: order.payment.amount - 49 - Math.round((order.payment.amount - 49) * 0.05),
        shipping: order.payment.amount >= 999 ? 0 : 49,
        gst: Math.round((order.payment.amount - 49) * 0.05),
        total: order.payment.amount,
        shippingAddress: order.shipping,
        trackingUrl: `${process.env.FRONTEND_URL}/track/${order.orderId}`
      });

      await this.transporter.sendMail({
        from: `"JOY PRO India" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Order Confirmed - ${order.orderId}`,
        html: html
      });

      console.log(`Order confirmation email sent to ${user.email}`);
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  async sendShippingUpdate(order, user, trackingInfo) {
    try {
      const template = await this.loadTemplate('shipping-update');
      
      const html = template({
        customerName: user.name,
        orderId: order.orderId,
        trackingNumber: trackingInfo.trackingNumber,
        carrier: trackingInfo.carrier || 'Blue Dart',
        estimatedDelivery: trackingInfo.estimatedDelivery,
        trackingUrl: trackingInfo.trackingUrl
      });

      await this.transporter.sendMail({
        from: `"JOY PRO India" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Your Order is on the Way - ${order.orderId}`,
        html: html
      });

    } catch (error) {
      console.error('Shipping email error:', error);
    }
  }

  async sendDeliveryConfirmation(order, user) {
    try {
      const template = await this.loadTemplate('delivery-confirmation');
      
      const html = template({
        customerName: user.name,
        orderId: order.orderId,
        deliveryDate: new Date().toLocaleDateString('en-IN'),
        reviewUrl: `${process.env.FRONTEND_URL}/review/${order.orderId}`
      });

      await this.transporter.sendMail({
        from: `"JOY PRO India" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Order Delivered - ${order.orderId} | How was your experience?`,
        html: html
      });

    } catch (error) {
      console.error('Delivery email error:', error);
    }
  }

  async loadTemplate(templateName) {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    return handlebars.compile(templateContent);
  }
}

module.exports = new EmailService();
