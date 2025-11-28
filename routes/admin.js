const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /stats - Get admin dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeListings = await Product.countDocuments();
        const orders = await Order.find();
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Mocking some data that we don't track yet
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
        const reportsToday = 5; // Mock

        res.json({
            totalUsers,
            activeListings,
            totalRevenue,
            newUsersToday,
            reportsToday,
            pendingApprovals: 12, // Mock
            totalTransactions: orders.length,
            platformFee: totalRevenue * 0.03 // Assuming 3% fee
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
