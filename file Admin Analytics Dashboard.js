// Admin analytics routes
router.get('/analytics/dashboard', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(endDate || Date.now());
    
    const [dailyStats, topProducts, revenueStats] = await Promise.all([
      analyticsService.getDashboardStats(start, end),
      analyticsService.getTopProducts(start, end),
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$payment.amount' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$payment.amount' }
          }
        }
      ])
    ]);
    
    res.json({
      dailyStats,
      topProducts,
      summary: revenueStats[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});
