// backend/src/config/firebase.js
const { initializeApp, cert } = require('firebase-admin/app');

const initializeFirebase = () => {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The optional chaining (?.) prevents crashes if the key is missing from .env
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin Initialized');
  } catch (error) {
    console.error(`Firebase Admin Setup Error: ${error.message}`);
  }
};

module.exports = { initializeFirebase };