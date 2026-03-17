import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import axios from 'axios';

if (!process.env.VERCEL) {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

// --- FIREBASE INIT ---
try {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error("🚨 MISSING FIREBASE KEYS!");
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

// --- MONNIFY HELPERS ---
const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com/api/v1';

async function getMonnifyToken() {
  const auth = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString('base64');
  const { data } = await axios.post(`${MONNIFY_BASE_URL}/auth/login`, {}, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return data.responseBody.accessToken;
}

// ==========================================
// 0. HEALTH CHECK
// ==========================================
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'success', message: 'The Express Backend is officially alive!' });
});

// ==========================================
// 1. SETTINGS API
// ==========================================
app.get(['/api/settings', '/settings'], async (req, res) => {
  try {
    const doc = await db.collection('portal').doc('settings').get();
    if (!doc.exists) {
      return res.status(200).json({ 
        status: 'coming_soon', comingSoonDate: '', programs: { ug: true, pg: true, jupeb: true } 
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
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      code: newCode, name, phone, uses: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('agents').doc(newCode).set(newAgent);
    res.status(201).json({ message: 'Agent created', agent: newAgent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// ==========================================
// 3. APPLICANTS & MONNIFY
// ==========================================

// GET: All Applicants
app.get(['/api/applicants', '/applicants'], async (req, res) => {
  try {
    const snapshot = await db.collection('applicants').orderBy('createdAt', 'desc').get();
    const applicants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// POST: Init Monnify Payment
app.post(['/api/pay/init', '/pay/init'], async (req, res) => {
  const { amount, customerName, customerEmail, program, refCode } = req.body;
  
  try {
    const token = await getMonnifyToken();
    const paymentReference = `REF-${Date.now()}`;

    // STEP 1: Initialize Transaction on Monnify
    const initRes = await axios.post(`${MONNIFY_BASE_URL}/merchant/transactions/init-transaction`, {
      amount: Number(amount), // Ensures amount is a float/number
      customerName: customerName,
      customerEmail: customerEmail,
      paymentReference: paymentReference,
      paymentDescription: `${program} Admission Form`,
      currencyCode: 'NGN',
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      redirectUrl: 'https://caleb-admission-portal.vercel.app/success',
      paymentMethods: ["ACCOUNT_TRANSFER"] // FIXED: Exactly as required by Monnify
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const monnifyTransactionRef = initRes.data.responseBody.transactionReference;

    // STEP 2: Get the dynamic bank account for the transfer
    const bankRes = await axios.post(`${MONNIFY_BASE_URL}/merchant/bank-transfer/init-payment`, {
      transactionReference: monnifyTransactionRef
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Save pending payment record to Firestore
    await db.collection('pending_payments').doc(paymentReference).set({
      customerName, 
      customerEmail, 
      program,
      refCode: refCode || 'DIRECT',
      amount: Number(amount), 
      status: 'PENDING',
      monnifyTransactionRef: monnifyTransactionRef,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send bank account details back to frontend
    res.json(bankRes.data.responseBody);
  } catch (error) {
    console.error("Monnify Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Payment initialization failed', details: error.response?.data || error.message });
  }
});

// POST: Monnify Webhook (CUL generation happens here)
app.post(['/api/monnify/webhook', '/monnify/webhook'], async (req, res) => {
  const { eventType, eventData } = req.body;

  if (eventType === 'SUCCESSFUL_TRANSACTION' && eventData.paymentStatus === 'PAID') {
    const payRef = eventData.paymentReference;
    const pendingDoc = await db.collection('pending_payments').doc(payRef).get();

    if (pendingDoc.exists) {
      const p = pendingDoc.data();
      
      // Generate CUL Applicant Number
      const pin = `CUL-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await db.collection('applicants').doc(pin).set({
        name: p.customerName,
        email: p.customerEmail,
        program: p.program,
        refCode: p.refCode,
        amount: p.amount,
        status: 'completed',
        pin: pin,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update Agent count if needed
      if (p.refCode !== 'DIRECT') {
        await db.collection('agents').doc(p.refCode).update({
          uses: admin.firestore.FieldValue.increment(1)
        });
      }
      await db.collection('pending_payments').doc(payRef).delete();
    }
  }
  
  // Acknowledge webhook receipt to Monnify
  res.status(200).send('OK');
});

export default app;