// backend/src/middleware/auth.js
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify token using modern Firebase Admin Auth
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Find user in MongoDB
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user && req.path !== '/sync') {
      return res.status(403).json({ error: 'User not synced in database.' });
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

module.exports = requireAuth;