const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    buyerId: {
        type: String, // String to support email addresses or user IDs
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sellerId: {
        type: String, // Seller email or ID
    },
    quantity: {
        type: Number,
        default: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    deliveryAddress: {
        type: String, // Full address
        required: false
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'cod'], // cod = Cash on Delivery
        default: 'unpaid'
    },
    paymentType: {
        type: String,
        enum: ['card', 'cash'],
        default: 'cash'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
