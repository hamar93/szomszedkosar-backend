require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications'); // If exists

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet()); // Security headers
app.use(express.json());

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Túl sok kérés erről az IP címről, kérlek próbáld újra később.'
});
app.use('/api/', limiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/users', authRoutes); // Auth first (register/login)
app.use('/api/users', userRoutes); // Users second (profile updates)
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.json({ status: "API Running" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));