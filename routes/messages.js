const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

const CryptoJS = require('crypto-js');
const SECRET_KEY = process.env.MESSAGE_SECRET || 'szomszedkosar_secret_key_123'; // Fallback for dev

// POST /send - Send a new message
router.post('/send', async (req, res) => {
    try {
        const { senderId, recipientId, content, productId } = req.body;

        // Validate inputs
        if (!senderId || !recipientId || !content) {
            return res.status(400).json({ error: 'Missing required fields: senderId, recipientId, content' });
        }

        // ENCRYPT CONTENT
        const encryptedContent = CryptoJS.AES.encrypt(content, SECRET_KEY).toString();

        // Create and save new message
        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            content: encryptedContent, // Save encrypted
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

        // DECRYPT CONTENT
        const decryptedMessages = messages.map(msg => {
            try {
                const bytes = CryptoJS.AES.decrypt(msg.content, SECRET_KEY);
                const originalText = bytes.toString(CryptoJS.enc.Utf8);

                // If decryption fails (empty string) or it wasn't encrypted (legacy), handle gracefully
                // For legacy messages (not encrypted), originalText might be empty if it's not valid ciphertext
                // But here we assume all new messages are encrypted. 
                // To support legacy, we could check if it looks like ciphertext or just return content if decryption fails.

                return {
                    ...msg.toObject(),
                    content: originalText || msg.content // Fallback to original if decryption yields empty (e.g. legacy plain text)
                };
            } catch (e) {
                return msg; // Return as is if error
            }
        });

        res.json(decryptedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
