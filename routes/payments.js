const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Order = require('../models/Order');

// A Frontend címe (ahová visszaküldjük a vevőt fizetés után)
// Ha nincs beállítva környezeti változóként, akkor a Netlify címet használja alapértelmezetten
const CLIENT_URL = process.env.CLIENT_URL || 'https://keen-cactus-9a2617.netlify.app';

// Segédfüggvény: Stripe ügyfél keresése vagy létrehozása
async function getOrCreateCustomer(user) {
    if (user.stripeCustomerId) {
        return user.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
    });

    user.stripeCustomerId = customer.id;
    await user.save();
    return customer.id;
}

// 1. HELYPÉNZ ELŐFIZETÉS (Havi 2000 Ft)
// POST /api/payments/create-subscription-checkout
router.post('/create-subscription-checkout', async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Felhasználó nem található' });

        const customerId = await getOrCreateCustomer(user);

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'huf',
                        product_data: {
                            name: 'SzomszédKosár Helypénz (Havi)',
                            description: 'Korlátlan feltöltés és marketing eszközök',
                        },
                        unit_amount: 200000, // 2000 Ft (fillérben kell megadni!)
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${CLIENT_URL}/payment?status=success`,
            cancel_url: `${CLIENT_URL}/payment?status=cancel`,
            metadata: {
                userId: user._id.toString(),
                type: 'subscription'
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe hiba:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. PUSH KREDIT VÁSÁRLÁS (300 Ft / db)
// POST /api/payments/create-credits-checkout
router.post('/create-credits-checkout', async (req, res) => {
    try {
        const { quantity, userId } = req.body;

        if (!quantity || !userId) {
            return res.status(400).json({ error: 'Hiányzó adatok' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Felhasználó nem található' });

        const customerId = await getOrCreateCustomer(user);

        // Ár: 300 Ft / db
        const unitPrice = 30000; // 300 Ft fillérben

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'huf',
                    product_data: {
                        name: `${quantity} db Push Értesítés Kredit`,
                        description: 'Azonnali értesítés a környékbeli vevőknek',
                    },
                    unit_amount: unitPrice,
                },
                quantity: quantity, // Pl. 5 vagy 10 db
            }],
            success_url: `${CLIENT_URL}/payment?status=success`,
            cancel_url: `${CLIENT_URL}/payment?status=cancel`,
            metadata: {
                userId: user._id.toString(),
                type: 'credits',
                quantity: quantity
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe hiba:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. RENDELÉS KIFIZETÉSE (Vevő)
// POST /api/payments/create-order-checkout
router.post('/create-order-checkout', async (req, res) => {
    try {
        const { orderId, userId } = req.body;

        if (!orderId || !userId) {
            return res.status(400).json({ error: 'Hiányzó adatok' });
        }

        const order = await Order.findById(orderId).populate('productId');
        const user = await User.findById(userId);

        if (!order || !user) return res.status(404).json({ error: 'Rendelés vagy felhasználó nem található' });

        const customerId = await getOrCreateCustomer(user);

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'huf',
                    product_data: {
                        name: `Rendelés: ${order.productId.name}`,
                        description: `Mennyiség: ${order.quantity} ${order.productId.unit}`,
                    },
                    unit_amount: Math.round(order.totalPrice * 100), // Fillérben
                },
                quantity: 1,
            }],
            success_url: `${CLIENT_URL}/payment?status=success&orderId=${order._id}`,
            cancel_url: `${CLIENT_URL}/payment?status=cancel`,
            metadata: {
                userId: user._id.toString(),
                orderId: order._id.toString(),
                type: 'order'
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe hiba:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;