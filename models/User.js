const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['buyer', 'producer'],
        default: 'buyer'
    },
    subscriptionStatus: {
        type: String,
        enum: ['free', 'active', 'canceled'],
        default: 'free'
    },
    subscriptionExpiresAt: {
        type: Date
    },
    pushCredits: {
        type: Number,
        default: 0
    },
    stripeCustomerId: {
        type: String
    },
    phone: {
        type: String
    },
    bio: {
        type: String
    },
    avatarUrl: {
        type: String
    },
    city: {
        type: String
    },
    deliveryOptions: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
