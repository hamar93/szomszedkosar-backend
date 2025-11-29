const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST /register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, phone, location, bio, avatarUrl } = req.body;

        // 1. Ellenőrzés: Létezik-e már a felhasználó
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Ez az email cím már regisztrálva van.' });
        }

        // 2. Alapvető adatok ellenőrzése
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Hiányzó adatok: név, email vagy jelszó.' });
        }

        // 3. Jelszó hash-elése
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Új felhasználó létrehozása
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            role: role || 'buyer',
            phone,
            location,
            city: location,
            bio,
            avatarUrl
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message || 'Szerver hiba a regisztráció során.' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // KRITIKUS ELLENŐRZÉS: User nem található VAGY nincs mentett jelszava (régi adat)
        if (!user || !user.password) {
            console.warn('Login failure: User not found or password hash missing.', email);
            return res.status(401).json({ message: 'Hibás email vagy jelszó' });
        }

        // Jelszó ellenőrzés
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Hibás email vagy jelszó' });
        }

        // SIKERES BELÉPÉS
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                role: user.role || 'buyer',
                name: user.name,
                city: user.city || user.location
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Hiba történt a bejelentkezés során.' });
    }
});

module.exports = router;