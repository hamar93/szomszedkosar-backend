const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    senderId: {
        type: String, // Email or ID of the producer
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    radius: {
        type: Number,
        default: 15 // km
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
