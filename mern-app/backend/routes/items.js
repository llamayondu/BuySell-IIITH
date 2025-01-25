const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Fetch items by IDs
router.post('/cart-items', async (req, res) => {
    const { itemIds } = req.body;
    console.log('Fetching items with IDs:', itemIds); // Debugging statement
    try {
        const items = await Item.find({ itemId: { $in: itemIds } });
        console.log('Fetched items:', items); // Debugging statement
        res.json(items);
    } catch (err) {
        console.error('Error fetching items:', err); // Debugging statement
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
