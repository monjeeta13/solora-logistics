// backend/src/controllers/shipmentController.js
const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { COURIER_OPTIONS, getCourierById } = require('../utils/courierConfig');
const { getPincodeDetails } = require('../utils/pincodeService');
const crypto = require('crypto');

const getDynamicEcoWaypoints = (senderCoords, recipientCoords) => {
  // Comprehensive network of Indian logistics consolidation hubs
  const transitHubs = [
    // Central
    { city: 'Nagpur Central Hub', lat: 21.1458, lng: 79.0882 },
    { city: 'Bhopal Transit Center', lat: 23.2599, lng: 77.4126 },
    { city: 'Indore Sort Facility', lat: 22.7196, lng: 75.8577 },
    { city: 'Raipur Node', lat: 21.2514, lng: 81.6296 },
    
    // North
    { city: 'Delhi NCR Gateway', lat: 28.6139, lng: 77.2090 },
    { city: 'Jaipur West Node', lat: 26.9124, lng: 75.7873 },
    { city: 'Lucknow UP Hub', lat: 26.8467, lng: 80.9462 },
    { city: 'Kanpur Sort Facility', lat: 26.4499, lng: 80.3319 },
    
    // West
    { city: 'Mumbai Logistics Park', lat: 19.0760, lng: 72.8777 },
    { city: 'Pune Transit Center', lat: 18.5204, lng: 73.8567 },
    { city: 'Ahmedabad West Hub', lat: 23.0225, lng: 72.5714 },
    { city: 'Surat Sort Node', lat: 21.1702, lng: 72.8311 },
    
    // South
    { city: 'Bangalore South Hub', lat: 12.9716, lng: 77.5946 },
    { city: 'Chennai East Node', lat: 13.0827, lng: 80.2707 },
    { city: 'Hyderabad South Gateway', lat: 17.3850, lng: 78.4867 },
    { city: 'Coimbatore SW Hub', lat: 11.0168, lng: 76.9558 },
    { city: 'Kochi Port Facility', lat: 9.9312, lng: 76.2673 },
    { city: 'Vijayawada Sort Center', lat: 16.5062, lng: 80.6480 },
    
    // East & North East
    { city: 'Kolkata Eastern Gateway', lat: 22.5726, lng: 88.3639 },
    { city: 'Patna East Gateway', lat: 25.5941, lng: 85.1376 },
    { city: 'Bhubaneswar East Coast', lat: 20.2961, lng: 85.8245 },
    { city: 'Guwahati NE Gateway', lat: 26.1445, lng: 91.7362 }
  ];

  // Calculate the geographical midpoint of the journey
  const midLat = (senderCoords.lat + recipientCoords.lat) / 2;
  const midLng = (senderCoords.lng + recipientCoords.lng) / 2;

  // Find the hub closest to the midpoint using Pythagorean distance
  let closestHub = transitHubs[0];
  let minDistance = Infinity;

  transitHubs.forEach(hub => {
    const distance = Math.sqrt(
      Math.pow(hub.lat - midLat, 2) + Math.pow(hub.lng - midLng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestHub = hub;
    }
  });

  return [closestHub];
};

// GET /api/shipments/quote
const getQuotes = (req, res) => {
  res.status(200).json({ couriers: COURIER_OPTIONS });
};

// GET /api/shipments
const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ shipments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
};

// GET /api/shipments/:id
const getShipmentById = async (req, res) => {
  try {
    const param = req.params.id;
    // Search by either internal shipmentId or tracking AWB number
    const shipment = await Shipment.findOne({
      userId: req.user._id,
      $or: [{ shipmentId: param }, { awbNumber: param }]
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.status(200).json({ shipment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipment details' });
  }
};

// POST /api/shipments/book
const bookShipment = async (req, res) => {
  const { senderDetails, recipientDetails, packageDetails, courierId } = req.body;
  const userId = req.user._id;

  const selectedCourier = getCourierById(courierId);
  if (!selectedCourier) {
    return res.status(400).json({ error: 'Invalid courier selected' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Verify Wallet Balance
    const user = await User.findById(userId).session(session);
    if (user.walletBalance < selectedCourier.price) {
      throw new Error('Insufficient wallet balance');
    }

    // 2. Fetch Pincode Details (City, State, Lat, Lng)
    const senderPinData = getPincodeDetails(senderDetails.pinCode);
    const recipientPinData = getPincodeDetails(recipientDetails.pinCode);

    if (!senderPinData || !recipientPinData) {
      throw new Error('One or both PIN codes are unserviceable.');
    }

    // 3. Attach accurate details from official dataset
    senderDetails.coordinates = { lat: senderPinData.lat, lng: senderPinData.lng };
    recipientDetails.coordinates = { lat: recipientPinData.lat, lng: recipientPinData.lng };

    senderDetails.city = senderPinData.district;
    senderDetails.state = senderPinData.state;
    recipientDetails.city = recipientPinData.district;
    recipientDetails.state = recipientPinData.state;

    // 4. Deduct Balance
    user.walletBalance -= selectedCourier.price;
    await user.save({ session });

    // 5. Generate IDs and Dates
    const shipmentId = `SHP${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const awbNumber = `AWB${Math.floor(100000000 + Math.random() * 900000000)}`;

    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + selectedCourier.estimatedDaysMax);

    // NEW: Eco Routing Logic
    let waypoints = [];
    if (selectedCourier.id === 'eco') {
      waypoints = getDynamicEcoWaypoints(
        senderDetails.coordinates, 
        recipientDetails.coordinates
      );
    }

    // 6. Create Shipment Record
    const newShipment = new Shipment({
      userId,
      shipmentId,
      awbNumber,
      senderDetails,
      recipientDetails,
      packageDetails,
      courier: {
        name: selectedCourier.name,
        serviceType: selectedCourier.id
      },
      shippingCost: selectedCourier.price,
      estimatedDeliveryDate: estDeliveryDate,
      waypoints, // <-- Dynamic eco waypoints
      currentStatus: 'Shipment Booked',
      trackingEvents: [{
        status: 'Shipment Booked',
        description: selectedCourier.id === 'eco' 
          ? 'Eco-shipping confirmed. Route optimized for lower emissions.' 
          : 'Shipment details received and booking confirmed.',
        location: senderDetails.city
      }]
    });
    await newShipment.save({ session });

    // 7. Create Wallet Debit Transaction
    const transaction = new WalletTransaction({
      userId,
      transactionId: `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      type: 'debit',
      amount: selectedCourier.price,
      description: `Shipment booking deduction (${awbNumber})`,
      shipmentId: newShipment._id,
      balanceAfter: user.walletBalance
    });
    await transaction.save({ session });

    // 8. Commit Transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Shipment booked successfully',
      shipment: newShipment,
      remainingBalance: user.walletBalance
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Booking Error:', error);

    if (error.message === 'Insufficient wallet balance') {
      return res.status(402).json({ error: error.message });
    }
    if (error.message === 'One or both PIN codes are unserviceable.') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to process booking' });
  }
};

module.exports = { getQuotes, bookShipment, getShipments, getShipmentById };