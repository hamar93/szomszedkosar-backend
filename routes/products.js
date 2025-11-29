const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 1. GET / - Összes termék lekérése (VAGY szűrés eladóra)
router.get('/', async (req, res) => {
    try {
        const { sellerEmail } = req.query;
        let query = {};

        // Ha van sellerEmail paraméter, akkor szűrünk rá
        if (sellerEmail) {
            query.sellerEmail = sellerEmail;
        }

        const products = await Product.find(query).sort({ createdAt: -1 }).limit(50);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET /:id - EGY termék lekérése ID alapján
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Termék nem található' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. POST / - Új termék létrehozása
router.post('/', async (req, res) => {
    try {
        // Alapvető validáció
        if (!req.body.name || !req.body.price) {
            return res.status(400).json({ message: "Hiányzó adatok (Név vagy Ár kötelező)" });
        }

        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE /:id - Termék törlése
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

// 5. PUT /:id/sale - Akciós ár beállítása
router.put('/:id/sale', async (req, res) => {
    try {
        const { salePrice, saleEndsAt } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (salePrice) {
            if (!product.originalPrice) {
                product.originalPrice = product.price;
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

module.exports = router;