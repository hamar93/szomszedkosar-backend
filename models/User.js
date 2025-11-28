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
        enum: ['free', 'paid'],
        default: 'free'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
