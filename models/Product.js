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
        required: true,
        enum: ["Zöldség", "Gyümölcs", "Tojás & Tej", "Hús & Húskészítmények", "Pékáru", "Édesség & Méz", "Italok", "Kamra", "Házi kozmetikum", "Kézműves & Otthon", "Kert és növények", "Állati termékek", "Szezonális"]
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        default: 1
    },
    originalPrice: {
        type: Number
    },
    saleEndsAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // B2B / Wholesale Fields
    isWholesaleAvailable: {
        type: Boolean,
        default: false
    },
    wholesalePrice: {
        type: Number
    },
    minWholesaleQuantity: {
        type: Number
    }
});

module.exports = mongoose.model('Product', ProductSchema);
