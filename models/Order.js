const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sellerId: { // Denormalized for easier querying
        type: String, // Storing email or ID depending on how we reference sellers. Product has sellerName, but maybe we should store sellerEmail or ID.
        // Looking at Product.js, it has sellerName. Let's look at how we identify sellers.
        // Product.js doesn't seem to have sellerId, just sellerName. Wait.
        // Let's check Product.js again.
        // It has sellerName.
        // In routes/products.js we filter by sellerEmail.
        // We should probably store sellerEmail in Product too if it's not there.
        // Let's check if Product has sellerEmail.
        // I viewed Product.js and it DOES NOT have sellerEmail.
        // But routes/products.js filters by sellerEmail.
        // Let's check routes/products.js again.
        // "const { sellerEmail } = req.query; ... query.sellerEmail = sellerEmail;"
        // This implies Product model MUST have sellerEmail.
        // I must have missed it or it's missing in the file I viewed.
        // Let me re-read the view_file output for Product.js.
        // It has: name, price, unit, description, sellerName, location, image, category, isUrgent, createdAt.
        // It DOES NOT have sellerEmail.
        // This is a bug in the backend. I need to add sellerEmail to Product.js as well.
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
