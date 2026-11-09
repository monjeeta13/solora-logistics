// backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  walletBalance: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);