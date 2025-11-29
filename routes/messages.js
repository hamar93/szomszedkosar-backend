const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST /send - Send a new message
router.post('/send', async (req, res) => {
    try {
        const { senderId, recipientId, content, productId } = req.body;

        // Validate inputs
        if (!senderId || !recipientId || !content) {
            return res.status(400).json({ error: 'Missing required fields: senderId, recipientId, content' });
        }

        // Create and save new message
        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            content,
            product: productId
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /:userId - Get messages for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all messages where sender OR recipient matches userId
        // Sort by createdAt descending (newest first)
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        }).sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
