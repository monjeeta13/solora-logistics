// backend/src/models/WalletTransaction.js
const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  transactionId: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
  balanceAfter: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);