const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// POST /stripe-webhook
// Important: This route needs raw body for signature verification.
// We will handle the raw body parsing in server.js or here if we use a specific middleware.
router.post('/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const type = session.metadata.type;

        try {
            const user = await User.findById(userId);
            if (user) {
                if (type === 'subscription') {
                    user.subscriptionStatus = 'active';
                    // Set expiry to 1 month from now (simplified) or use Stripe's period_end
                    user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    await user.save();
                    console.log(`User ${userId} subscription activated.`);
                } else if (type === 'credits') {
                    const quantity = parseInt(session.metadata.quantity || '0', 10);
                    user.pushCredits += quantity;
                    await user.save();
                    console.log(`User ${userId} added ${quantity} credits.`);
                }
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }

    res.send();
});

module.exports = router;
