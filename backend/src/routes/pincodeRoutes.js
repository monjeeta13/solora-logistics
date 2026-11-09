// backend/src/routes/pincodeRoutes.js
const express = require('express');
const { lookupPincode } = require('../controllers/pincodeController');
const router = express.Router();

// Open route for the frontend form validation
router.get('/:pincode', lookupPincode);

module.exports = router;