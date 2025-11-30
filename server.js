require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Route Importok
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const orderRoutes = require('./routes/orders');
// const notificationRoutes = require('./routes/notifications'); // Ha már létezik a fájl, vedd ki a kommentet

const app = express();
const PORT = process.env.PORT || 10000;

// --- 1. RENDER FIX: PROXY TRUST ---
// Ez kötelező a Renderen, különben a Rate Limiter hibát dob
app.set('trust proxy', 1); 
// ---------------------------------

// Middleware
app.use(cors({
  origin: ['https://szomszedkosar.netlify.app', 'https://keen-cactus-9a2617.netlify.app', 'http://localhost:3000', '*'], 
  credentials: true
}));
app.use(express.json());

// Rate Limiter (Túlterhelés elleni védelem)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 perc
  max: 100, // Limit: 100 kérés IP-nként
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes Csatlakoztatása
app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
// app.use('/api/notifications', notificationRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ status: "API Running on Render", timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});