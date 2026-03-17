import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs';
import path from 'path';

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
    res.status(500).json({ error: 'Failed to create agent'});
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
  const { amount, customerName, customerEmail, program, refCode, redirectUrl } = req.body;
  
  try {
    const token = await getMonnifyToken();
    const paymentReference = `REF-${Date.now()}`;

    // --- FEE CALCULATION ---
    // User requested: 1.5% fee + 100 naira added to the base amount
    const baseAmount = Number(amount);
    const fee = (baseAmount * 0.015) + 100;
    const totalAmount = baseAmount + fee;

    // STEP 1: Initialize Transaction on Monnify
    const initRes = await axios.post(`${MONNIFY_BASE_URL}/merchant/transactions/init-transaction`, {
      amount: totalAmount, // Send the total amount to Monnify
      customerName: customerName,
      customerEmail: customerEmail,
      paymentReference: paymentReference,
      paymentDescription: `${program} Admission Form`,
      currencyCode: 'NGN',
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      redirectUrl: redirectUrl,
      paymentMethods: ["ACCOUNT_TRANSFER"] // Only allow Bank Transfers
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const responseBody = initRes.data.responseBody;

    // Save pending payment record to Firestore with fee breakdown
    await db.collection('pending_payments').doc(paymentReference).set({
      customerName, 
      customerEmail, 
      program,
      refCode: refCode || 'DIRECT',
      baseAmount: baseAmount,
      fee: fee,
      totalAmount: totalAmount, 
      status: 'PENDING',
      monnifyTransactionRef: responseBody.transactionReference,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send the checkoutUrl and breakdown back to the React frontend
    res.json({
      checkoutUrl: responseBody.checkoutUrl,
      transactionReference: responseBody.transactionReference,
      breakdown: {
        baseAmount,
        fee,
        totalAmount
      }
    });

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
        amount: p.totalAmount, // Log what they actually paid
        status: 'ongoing',
        pin: pin,
        paymentReference: payRef,
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

// GET: Verify Payment & Fetch PIN
app.get(['/api/pay/verify', '/pay/verify'], async (req, res) => {
  const { ref } = req.query;
  if (!ref) return res.status(400).json({ error: 'Missing reference' });

  try {
    // 1. Search the applicants collection for this specific payment reference
    const applicantQuery = await db.collection('applicants').where('paymentReference', '==', ref).limit(1).get();
    
    if (!applicantQuery.empty) {
      const data = applicantQuery.docs[0].data();
      return res.status(200).json({ pin: data.pin, name: data.name }); // Payment confirmed!
    }

    // 2. If it's not in applicants yet, check if it's still waiting in pending_payments
    const pendingDoc = await db.collection('pending_payments').doc(ref).get();
    if (pendingDoc.exists) {
      return res.status(400).json({ error: 'Payment still pending. We are waiting for Monnify.' });
    }

    res.status(404).json({ error: 'Payment reference not found.' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});


// ==========================================
// 4. BIODATA ENDPOINTS
// ==========================================

// POST: Biodata Login (Check if PIN is real)
app.post(['/api/biodata/login', '/biodata/login'], async (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN is required' });

  try {
    const doc = await db.collection('applicants').doc(pin).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Invalid PIN. Please check and try again.' });
    }
    
    // Returns the applicant data back to the React UI
    res.status(200).json(doc.data());
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST: Submit Final Biodata
app.post(['/api/biodata/submit', '/biodata/submit'], async (req, res) => {
  const { pin, biodata } = req.body;
  
  try {
    // Merge the new biodata with their existing record and mark as completed
    await db.collection('applicants').doc(pin).update({
      biodata: biodata,
      status: 'completed', // This tells the Admin Dashboard they are finished!
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save biodata' });
  }
});

// POST: Generate Final Application PDF
app.post(['/api/biodata/generate-pdf', '/biodata/generate-pdf'], async (req, res) => {
  const { pin } = req.body;

  try {
    const doc = await db.collection('applicants').doc(pin).get();
    if (!doc.exists) return res.status(404).json({ error: 'Applicant not found' });
    
    const data = doc.data();
    const bio = data.biodata || {};

    // Robust path detection
    const templatePath = path.join(process.cwd(), 'assets', 'Admissionform1st May 2020.pdf');
    
    console.log("Attempting to load PDF from:", templatePath);

    if (!fs.existsSync(templatePath)) {
      console.error("CRITICAL: PDF Template missing at path:", templatePath);
      return res.status(500).json({ error: `Server Error: Template file not found.` });
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // --- DRAWING ---
    // Note: session , jamb reg , jamb score , name [cite: 1]
    
    // Application Number (Top Right)
    firstPage.drawText(pin, { x: 440, y: 765, size: 10, font });

    // Session
    firstPage.drawText("2026/2027", { x: 440, y: 700, size: 10, font });

    // JAMB Details
    firstPage.drawText(bio.jambRegNo || 'N/A', { x: 130, y: 565, size: 11, font });
    firstPage.drawText(String(bio.academicScore || 'N/A'), { x: 130, y: 550, size: 11, font });

    // Full Name
    const fullName = `${(bio.lastName || '').toUpperCase()}, ${bio.firstName || ''} ${bio.middleName || ''}`;
    firstPage.drawText(fullName, { x: 130, y: 520, size: 11, font });

    const pdfBytes = await pdfDoc.save();
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');
    
    res.status(200).json({ pdf: base64Pdf });

  } catch (error) {
    console.error("Backend PDF Error:", error);
    res.status(500).json({ error: 'Failed to generate PDF internal server error' });
  }
});

export default app;