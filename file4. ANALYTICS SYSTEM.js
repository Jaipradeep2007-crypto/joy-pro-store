// services/analyticsService.js
const mongoose = require('mongoose');

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true }, // 'order', 'visit', 'product_view'
  data: { type: mongoose.Schema.Types.Mixed },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  userAgent: String,
  ip: String
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

class AnalyticsService {
  async trackOrder(order, req) {
    await Analytics.create({
      date: new Date(),
      type: 'order',
      data: {
        orderId: order.orderId,
        amount: order.payment.amount,
        items: order.items.length,
        paymentMethod: order.payment.method
      },
      userId: order.userId,
      sessionId: req.sessionID,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  }

  async trackProductView(productId, req) {
    await Analytics.create({
      date: new Date(),
      type: 'product_view',
      data: { productId },
      userId: req.user?._id,
      sessionId: req.sessionID,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  }

  async getDashboardStats(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          type: 'order'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          revenue: { $sum: "$data.amount" },
          orders: { $sum: 1 },
          items: { $sum: "$data.items" }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await Analytics.aggregate(pipeline);
  }

  async getTopProducts(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          type: 'product_view'
        }
      },
      {
        $group: {
          _id: "$data.productId",
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ];

    return await Analytics.aggregate(pipeline);
  }
}

module.exports = new AnalyticsService();
