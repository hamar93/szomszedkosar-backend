const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 1. GET / - Összes termék lekérése (VAGY szűrés eladóra, VAGY rendezés távolság/város szerint)
router.get('/', async (req, res) => {
    try {
        const { sellerEmail, city } = req.query;
        let query = {};

        // Ha van sellerEmail paraméter (Producer Profile), akkor szűrünk rá és MINDENT visszaadunk (készlet 0 is)
        if (sellerEmail) {
            query.sellerEmail = sellerEmail;
        } else {
            // Ha NINCS sellerEmail (Public Feed/Search), akkor CSAK a készleten lévőket mutatjuk
            query.stock = { $gt: 0 };
        }

        let products = await Product.find(query).sort({ createdAt: -1 }).limit(50);

        // Ha van 'city' paraméter, rendezzük előre azokat, amik abban a városban vannak
        if (city) {
            console.log(`📍 Sorting products for city: ${city}`);
            products = products.sort((a, b) => {
                const aMatch = a.location && a.location.toLowerCase().includes(city.toLowerCase());
                const bMatch = b.location && b.location.toLowerCase().includes(city.toLowerCase());

                if (aMatch && !bMatch) return -1; // a comes first
                if (!aMatch && bMatch) return 1;  // b comes first
                return 0;
            });
        }

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
        console.log('🔍 DEBUG: Received product creation request');
        console.log('🔍 DEBUG: req.body =', req.body);
        console.log('🔍 DEBUG: sellerEmail =', req.body.sellerEmail);

        // Alapvető validáció
        if (!req.body.name || !req.body.price) {
            return res.status(400).json({ message: "Hiányzó adatok (Név vagy Ár kötelező)" });
        }

        // KRITIKUS: Ellenőrizzük hogy sellerEmail el van küldve
        if (!req.body.sellerEmail) {
            console.warn('⚠️ WARNING: sellerEmail is missing!');
            return res.status(400).json({ message: "Hiányzó sellerEmail - a termék nem hozható létre" });
        }

        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();

        console.log('✅ SUCCESS: Product created with sellerEmail:', savedProduct.sellerEmail);
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

// 5. PUT /:id - Termék frissítése (pl. készlet, ár, leírás)
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } // Visszaadja a frissített dokumentumot
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. PUT /:id/sale - Akciós ár beállítása (Megtartva kompatibilitás miatt, de a fenti PUT is tudja)
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