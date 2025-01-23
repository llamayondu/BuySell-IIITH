const express = require('express');
const Item = require('../models/Item');
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

// POST: Add a new item
router.post('/', authenticate, async (req, res) => {
    const { name, price, description, category } = req.body;
    try {
        const item = new Item({
            name,
            price,
            description,
            category,
            sellerId: req.userId
        });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch items by seller
router.get('/my-items', authenticate, async (req, res) => {
    try {
        const items = await Item.find({ sellerId: req.userId });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch a single item by ID
router.get('/:itemId', authenticate, async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
