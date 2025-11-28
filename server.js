require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://szomszedkosar.netlify.app', 'http://localhost:3000', '*'], // Hozzáadtam a localhost-ot is a biztonság kedvéért fejlesztéshez
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// --- JAVÍTÁS ITT TÖRTÉNT ---
// A frontend a /api/users/register címre küld, ezért itt is /api/users kell legyen
app.use('/api/users', authRoutes); 
// ---------------------------

app.use('/api/products', productRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ status: "Backend is working!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});