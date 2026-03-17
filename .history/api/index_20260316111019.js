const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route to test if the server is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Caleb University Backend is running perfectly on Vercel!' 
  });
});

// Export the Express API for Vercel
module.exports = app;