const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin securely
try {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error("🚨 MISSING FIREBASE KEYS IN VERCEL ENVIRONMENT VARIABLES!");
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
        }),
      });
      console.log("✅ Firebase connected successfully!");
    }
  }
} catch (error) {
  console.error("🚨 FIREBASE INIT ERROR:", error.message);
}

const db = admin.firestore();

// ==========================================
// 0. HEALTH CHECK
// ==========================================
// Using an array so it catches it no matter how Vercel rewrites it!
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'The Express Backend is officially alive!' 
  });
});

// ==========================================
// 1. SETTINGS API
// ==========================================
app.get(['/api/settings', '/settings'], async (req, res) => {
  try {
    const doc = await db.collection('portal').doc('settings').get();
    if (!doc.exists) {
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

app.post(['/api/settings', '/settings'], async (req, res) => {
  try {
    const newSettings = req.body;
    await db.collection('portal').doc('settings').set(newSettings);
    res.status(200).json({ message: 'Settings updated successfully', settings: newSettings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ==========================================
// 2. AGENTS API
// ==========================================
app.get(['/api/agents', '/agents'], async (req, res) => {
  try {
    const snapshot = await db.collection('agents').orderBy('createdAt', 'desc').get();
    const agents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

app.post(['/api/agents', '/agents'], async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `CRF-${randomString}`;

    const newAgent = {
      code: newCode,
      name,
      phone,
      uses: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('agents').doc(newCode).set(newAgent);
    res.status(201).json({ message: 'Agent created', agent: newAgent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// ==========================================
// LOCAL DEVELOPMENT SETUP
// ==========================================
// This code checks if you are running the file directly on your computer.
// If yes, it starts a local server on port 3001. If Vercel runs it, it skips this!
if (require.main === module) {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Local backend is running on http://localhost:${PORT}`);
    console.log(`👉 Test the health route here: http://localhost:${PORT}/api/health`);
  });
}

// Native Vercel Export
module.exports = app;