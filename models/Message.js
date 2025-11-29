const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // User ID or Email
    recipient: { type: String, required: true }, // User ID or Email
    content: { type: String, required: true },
    product: { type: String }, // Optional: Product ID related to the chat
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
