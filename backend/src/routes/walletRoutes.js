// backend/src/routes/walletRoutes.js
const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/walletController');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.post('/create-order', requireAuth, createOrder);
router.post('/verify-payment', requireAuth, verifyPayment);

module.exports = router;