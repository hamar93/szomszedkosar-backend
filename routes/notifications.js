const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');

// POST /send - Send a push notification (deducts 1 credit)
router.post('/send', async (req, res) => {
    try {
        const { userId, message, radius = 15 } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ message: 'Hiányzó adatok' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Felhasználó nem található' });
        }

        // Check credits
        if (user.pushCredits < 1) {
            return res.status(403).json({ message: 'Nincs elég kredited! Kérlek vásárolj a profil oldalon.' });
        }

        // Create Notification
        const notification = new Notification({
            senderId: user.email,
            senderName: user.name,
            message,
            radius
        });
        await notification.save();

        // Deduct credit
        user.pushCredits -= 1;
        await user.save();

        console.log(`📢 PUSH SENT: "${message}" from ${user.email} (Radius: ${radius}km)`);

        res.status(201).json({
            message: 'Sikeres küldés!',
            remainingCredits: user.pushCredits
        });

    } catch (error) {
        console.error('Push error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET / - Get recent notifications (mock feed)
router.get('/', async (req, res) => {
    try {
        // Return last 20 notifications sorted by date
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
