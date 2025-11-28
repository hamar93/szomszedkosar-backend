const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        // Placeholder: In a real app, hash password here
        const newUser = new User({ email, password, name, role });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Placeholder: In a real app, verify password and generate token
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json({ message: 'Login successful', user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
