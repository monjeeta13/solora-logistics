// backend/src/routes/dashboardRoutes.js
const express = require('express');
const { getDashboardSummary, getWalletTransactions } = require('../controllers/dashboardController');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.get('/summary', requireAuth, getDashboardSummary);
router.get('/wallet/transactions', requireAuth, getWalletTransactions);

module.exports = router;