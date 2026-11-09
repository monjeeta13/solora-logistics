// backend/src/controllers/walletController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/wallet/create-order
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in INR
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid recharge amount' });
    }

    const options = {
      amount: amount * 100, // Razorpay works in minimal currency units (paise)
      currency: 'INR',
      receipt: `rcpt_${req.user._id}_${Date.now().toString().slice(-4)}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ order });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// POST /api/wallet/verify-payment
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
  const userId = req.user._id;

  // 1. Verify Signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  // 2. Atomic Wallet Credit Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    user.walletBalance += amount;
    await user.save({ session });

    const transaction = new WalletTransaction({
      userId,
      transactionId: `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      type: 'credit',
      amount: amount,
      description: `Razorpay Wallet Recharge (${razorpay_payment_id})`,
      balanceAfter: user.walletBalance
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ 
      message: 'Payment verified and wallet recharged', 
      newBalance: user.walletBalance 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Wallet Credit Error:', error);
    res.status(500).json({ error: 'Failed to credit wallet' });
  }
};

module.exports = { createOrder, verifyPayment };