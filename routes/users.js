const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /register - Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, subscription } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({
            name,
            email,
            password, // Note: In a real app, hash this password!
            role,
            subscription
        });

        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /login - Login (basic implementation)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Note: In a real app, compare hashed passwords!
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /profile - Update user profile
router.put('/profile', async (req, res) => {
    try {
        const { email, name, city, bio, phone, avatarUrl, deliveryOptions, logistics } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required to identify user' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    name,
                    city,
                    bio,
                    phone,
                    avatarUrl,
                    avatarUrl,
                    deliveryOptions,
                    logistics
                }
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET / - Get all users (optionally filter by role)
router.get('/', async (req, res) => {
    try {
        const { role } = req.query;
        const query = {};

        if (role) {
            query.role = role;
        }

        const users = await User.find(query).select('-password'); // Exclude password
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
