const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// POST: Add a new user
router.post('/', async (req, res) => {
    const { firstName, lastName, email, age, contactNumber, password } = req.body;
    const domainRegex = /(students\.iiit\.ac\.in|research\.iiit\.ac\.in)$/;
    if (!domainRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email domain' });
    }
    try {
        const hashedPass = await bcrypt.hash(password, 10);
        console.log("register password: ", hashedPass);
        const user = new User({
            firstName,
            lastName,
            email,
            age,
            contactNumber,
            password: hashedPass
        });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log("Generated token: ", token); // Debugging statement
        res.json({ token });
    } catch (err) {
        console.error("Error during login: ", err); // Debugging statement
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch current user
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update current user
router.put('/me', authenticate, async (req, res) => {
    const { firstName, lastName, email, age, contactNumber } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.userId, {
            firstName,
            lastName,
            email,
            age,
            contactNumber
        }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
