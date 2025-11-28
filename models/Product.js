const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    sellerName: {
        type: String,
        required: true
    },
    sellerEmail: {
        type: String,
        // required: true // Make it optional for now to avoid breaking existing data if any
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
