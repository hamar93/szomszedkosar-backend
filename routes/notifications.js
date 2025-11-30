const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const User = require('../models/User');

// VAPID Keys - In production, these should be in environment variables
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BL45wWzteYh93_KYUFF9UZOu9GSuK10Z2ubePP3Um23y9i9DCV6-1giYFPeX-k85jMWDhi16aOE4zA-4DtXu5Mk';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'OXmXnMde1VzOUrnbiOlcwq3L-BS-3VwvPx8WOnD-sYk';

webpush.setVapidDetails(
    'mailto:support@szomszedkosar.hu',
    publicVapidKey,
    privateVapidKey
);

// Subscribe Route
router.post('/subscribe', async (req, res) => {
    try {
        const { subscription, userId } = req.body;

        if (!userId || !subscription) {
            return res.status(400).json({ message: 'Hiányzó adatok' });
        }

        // Save subscription to user
        await User.findByIdAndUpdate(userId, { pushSubscription: subscription });

        res.status(201).json({ message: 'Feliratkozás sikeres' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Hiba a feliratkozás során' });
    }
});

// Send Alert Route (Trigger)
router.post('/send-alert', async (req, res) => {
    try {
        const { message, location, radius } = req.body;

        // In a real app, we would query users based on location using MongoDB geospatial queries.
        // For now, we'll send to ALL users who have a subscription.
        const users = await User.find({ pushSubscription: { $exists: true, $ne: null } });

        const payload = JSON.stringify({
            title: 'SzomszédKosár Értesítés',
            body: message,
            icon: '/icons/icon-192x192.png' // Ensure this icon exists or use a default
        });

        let successCount = 0;
        let failureCount = 0;

        const promises = users.map(user => {
            return webpush.sendNotification(user.pushSubscription, payload)
                .then(() => {
                    successCount++;
                })
                .catch(err => {
                    console.error(`Error sending to user ${user._id}:`, err);
                    failureCount++;
                    // Optional: Remove invalid subscriptions
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        User.findByIdAndUpdate(user._id, { $unset: { pushSubscription: "" } }).exec();
                    }
                });
        });

        await Promise.all(promises);

        res.json({
            message: 'Értesítések elküldve',
            stats: { success: successCount, failure: failureCount }
        });

    } catch (error) {
        console.error('Send alert error:', error);
        res.status(500).json({ message: 'Hiba az értesítések küldésekor' });
    }
});

module.exports = router;
