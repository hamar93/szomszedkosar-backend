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
        enum: ['buyer', 'producer', 'admin', 'chef'],
        default: 'buyer',
        required: false
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
        type: String,
        required: false
    },
    companyName: {
        type: String,
        required: false
    },
    taxNumber: {
        type: String,
        required: false
    },
    deliveryOptions: {
        type: [String],
        default: []
    },
    logistics: {
        hasLocalPickup: { type: Boolean, default: true },
        pickupAddress: { type: String, default: '' },
        hasHomeDelivery: { type: Boolean, default: false },
        deliveryRadius: { type: Number, default: 0 },
        deliveryCost: { type: Number, default: 0 },
        hasShipping: { type: Boolean, default: false }
    },
    pushSubscription: {
        type: Object,
        required: false
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
