// backend/src/routes/authRoutes.js
const express = require('express');
const { syncUser } = require('../controllers/authController');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.post('/sync', requireAuth, syncUser);

module.exports = router;