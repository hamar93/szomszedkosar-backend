require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Route-ok importálása
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
// Ha a payment route-ot létrehoztuk az előző lépésben, azt is be kell hívni:
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://szomszedkosar.netlify.app', 'http://localhost:3000', '*'],
  credentials: true
}));
app.use(express.json());

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});