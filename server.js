require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// MOUNT ROUTES (CRITICAL PART)
app.use('/api/users', authRoutes); // Auth first (register/login)
app.use('/api/users', userRoutes); // Users second (profile updates)
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => res.json({ status: "API Running" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));