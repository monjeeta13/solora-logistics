// backend/src/controllers/authController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const crypto = require('crypto');

const syncUser = async (req, res) => {
  const { uid, name, email, picture } = req.firebaseUser;
  
  try {
    let user = await User.findOne({ firebaseUid: uid });
    
    // If returning user, just return their data
    if (user) {
      return res.status(200).json({ user, isNew: false });
    }

    // If new user, create record and give 500 INR credit atomically
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      user = new User({
        firebaseUid: uid,
        name: name || 'Demo User',
        email: email,
        image: picture,
        walletBalance: 500
      });
      await user.save({ session });

      const transaction = new WalletTransaction({
        userId: user._id,
        transactionId: `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        type: 'credit',
        amount: 500,
        description: 'Welcome Bonus Credit',
        balanceAfter: 500
      });
      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ user, isNew: true });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ error: 'Internal server error during user sync' });
  }
};

module.exports = { syncUser };