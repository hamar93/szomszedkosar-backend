const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /stats
router.get('/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();

        res.json({
            users: userCount,
            products: productCount,
            orders: orderCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
