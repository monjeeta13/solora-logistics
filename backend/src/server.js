// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { initializeFirebase } = require('./config/firebase');
const { loadPincodes } = require('./utils/pincodeService');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pincodeRoutes = require('./routes/pincodeRoutes');
const walletRoutes = require('./routes/walletRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Connections
connectDB();
initializeFirebase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Logistics API is running' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/wallet', walletRoutes);

// Start Server strictly after CSV memory load
const startServer = async () => {
  await loadPincodes(); 
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();