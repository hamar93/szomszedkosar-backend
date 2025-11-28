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

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes használata
app.use('/api/users', authRoutes);      // Fontos: a frontend /api/users -t hív!
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes); // Fizetési rendszer

// Test Route (Hogy lásd, fut-e)
app.get('/', (req, res) => {
  res.json({ status: "Backend is working!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});