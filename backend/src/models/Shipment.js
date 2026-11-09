// backend/src/models/Shipment.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  // Added to support the Google Maps polyline feature
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { _id: false });

const waypointSchema = new mongoose.Schema({
  city: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false });

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  location: { type: String }
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shipmentId: { type: String, required: true, unique: true, index: true },
  awbNumber: { type: String, required: true, unique: true, index: true },

  senderDetails: { type: addressSchema, required: true },
  recipientDetails: { type: addressSchema, required: true },

  packageDetails: {
    weight: { type: Number, required: true },
    description: { type: String, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true }
  },

  courier: {
    name: { type: String, required: true },
    serviceType: { type: String, required: true }
  },
  shippingCost: { type: Number, required: true },

  bookingDate: { type: Date, default: Date.now },
  estimatedDeliveryDate: { type: Date, required: true },
  waypoints: [waypointSchema],

  currentStatus: {
    type: String,
    enum: ['Shipment Booked', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Shipment Booked'
  },
  trackingEvents: [trackingEventSchema]
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);