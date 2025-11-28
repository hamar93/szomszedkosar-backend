const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET / - Fetch all products (limit 20)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().limit(20).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST / - Create a new product
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
