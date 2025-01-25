const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Fetch buyers by IDs
router.post('/buyers', async (req, res) => {
    const { buyerIds } = req.body;
    console.log('Fetching buyers with IDs:', buyerIds); // Debugging statement
    try {
        const buyers = await User.find({ _id: { $in: buyerIds } });
        console.log('Fetched buyers:', buyers); // Debugging statement
        res.json(buyers);
    } catch (err) {
        console.error('Error fetching buyers:', err); // Debugging statement
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
