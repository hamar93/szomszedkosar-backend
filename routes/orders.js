const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// POST / - Create a new order
router.post('/', async (req, res) => {
    try {
        let { productId, buyerId, quantity = 1 } = req.body;

        // If buyerId is not in body, try to get it from the authenticated user (if middleware is used)
        if (!buyerId && req.user && req.user.id) {
            buyerId = req.user.id;
        }

        if (!buyerId) {
            return res.status(400).json({ message: 'Buyer ID is required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        const totalPrice = product.price * quantity;

        const order = new Order({
            buyerId,
            productId,
            sellerId: product.sellerEmail, // Assuming we added sellerEmail to Product
            quantity,
            totalPrice
        });

        await order.save();

        // Decrement stock
        product.stock -= quantity;
        await product.save();

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
