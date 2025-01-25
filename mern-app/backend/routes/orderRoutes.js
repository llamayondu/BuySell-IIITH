const express = require('express');
const Order = require('../models/Order');
const Item = require('../models/Item');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
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

// POST: Place an order
router.post('/place-order', authenticate, async (req, res) => {
    const { itemIds } = req.body;
    try {
        const items = await Item.find({ itemId: { $in: itemIds } });
        const sellerIds = [...new Set(items.map(item => item.sellerId))];
        const amount = items.reduce((sum, item) => sum + item.price, 0);
        const hashedOtp = new Map();
        const unhashedOtp = new Map();

        for (const sellerId of sellerIds) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const hashed = await bcrypt.hash(otp, 10);
            hashedOtp.set(sellerId, hashed);
            unhashedOtp.set(sellerId, otp);
        }

        const order = new Order({
            buyerId: req.userId,
            sellerIds,
            itemIds,
            amount,
            hashedOtp
        });

        await order.save();
        res.status(201).json({ order, unhashedOtp });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch orders by buyer
router.get('/buyer-orders', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.userId });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch orders by seller
router.get('/seller-orders', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ sellerIds: req.userId });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
