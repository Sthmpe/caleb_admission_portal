const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin securely using your .env variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // We must replace the escaped newlines so the key works correctly
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), 
    }),
  });
}

const db = admin.firestore();

// ----------------------------------------------------
// ROUTE 1: Get Admin Settings
// ----------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const doc = await db.collection('portal').doc('settings').get();
    if (!doc.exists) {
      // Return default settings if database is completely empty
      return res.status(200).json({ 
        status: 'coming_soon', 
        comingSoonDate: '', 
        programs: { ug: true, pg: true, jupeb: true } 
      });
    }
    res.status(200).json(doc.data());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ----------------------------------------------------
// ROUTE 2: Update Admin Settings
// ----------------------------------------------------
app.post('/api/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    await db.collection('portal').doc('settings').set(newSettings);
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Export the Express API
module.exports = app;