// backend/src/controllers/dashboardController.js
const Shipment = require('../models/Shipment');
const WalletTransaction = require('../models/WalletTransaction');

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const shipments = await Shipment.find({ userId }).sort({ createdAt: -1 });
    const recentShipments = shipments.slice(0, 5); // top 5 for dashboard
    
    const totalSpent = shipments.reduce((sum, s) => sum + s.shippingCost, 0);
    const deliveredCount = shipments.filter(s => s.currentStatus === 'Delivered').length;

    res.status(200).json({
      walletBalance: req.user.walletBalance,
      totalShipments: shipments.length,
      totalSpent,
      deliveredCount,
      recentShipments
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

const getWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ transactions, currentBalance: req.user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet history' });
  }
};

module.exports = { getDashboardSummary, getWalletTransactions };