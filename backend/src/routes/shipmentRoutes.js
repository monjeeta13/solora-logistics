// backend/src/routes/shipmentRoutes.js
const express = require('express');
const { getQuotes, bookShipment } = require('../controllers/shipmentController');
const { getShipments, getShipmentById } = require('../controllers/shipmentController');
const { cancelShipment } = require('../controllers/shipmentController');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.get('/quote', requireAuth, getQuotes);
router.post('/book', requireAuth, bookShipment);
router.get('/', requireAuth, getShipments);
router.get('/:id', requireAuth, getShipmentById);
router.post('/:id/cancel', requireAuth, cancelShipment);

module.exports = router;