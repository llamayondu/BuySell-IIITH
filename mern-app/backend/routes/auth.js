const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

router.get('/auth-check', async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        console.error('No token provided'); // Debugging statement
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Debugging statement
        const user = await User.findById(decoded.id);
        if (!user) {
            console.error('User not found'); // Debugging statement
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User found:', user); // Debugging statement
        res.json({ userId: user._id });
    } catch (err) {
        console.error('Error in auth-check:', err); // Debugging statement
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
