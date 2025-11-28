const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// POST /create-subscription-checkout
router.post('/create-subscription-checkout', async (req, res) => {
    try {
        const { priceId, userId, successUrl, cancelUrl } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() }
            });
            customerId = customer.id;
            user.stripeCustomerId = customerId;
            await user.save();
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { userId: user._id.toString(), type: 'subscription' }
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /create-credits-checkout
router.post('/create-credits-checkout', async (req, res) => {
    try {
        const { quantity, userId, successUrl, cancelUrl } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() }
            });
            customerId = customer.id;
            user.stripeCustomerId = customerId;
            await user.save();
        }

        // Define price per credit or total amount. Assuming dynamic price for simplicity or a fixed price ID.
        // For this example, let's assume 1 credit = 100 HUF (approx). 
        // Better approach: Pass a priceId for a "Credit Pack" or calculate amount.
        // Let's use ad-hoc price for flexibility as requested "Receives quantity".

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'huf',
                    product_data: {
                        name: `${quantity} Push Notification Credits`,
                    },
                    unit_amount: 10000, // 100 HUF * 100 cents. Example price!
                },
                quantity: quantity,
            }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { userId: user._id.toString(), type: 'credits', quantity: quantity }
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
