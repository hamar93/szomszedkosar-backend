const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET / - Fetch all products (limit 20) or filter by sellerEmail
// GET /api/products
router.get('/', async (req, res) => {
    try {
        const { sellerEmail } = req.query;
        let query = {};

        // HA van sellerEmail paraméter, akkor CSAK az övéit adjuk vissza
        if (sellerEmail) {
            query = { sellerEmail: sellerEmail };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /:id - Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /:id - Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /:id/sale - Set sale price
router.put('/:id/sale', async (req, res) => {
    try {
        const { salePrice, saleEndsAt } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // If salePrice is provided, set it as current price and store original
        if (salePrice) {
            if (!product.originalPrice) {
                product.originalPrice = product.price; // Store original price if not already stored
            }
            product.price = salePrice;
        }

        if (saleEndsAt) {
            product.saleEndsAt = saleEndsAt;
        }

        await product.save();
        res.json(product);
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
