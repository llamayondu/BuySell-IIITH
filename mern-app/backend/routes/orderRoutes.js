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

        // Generate a single OTP for all sellers
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        console.log(`Unhashed OTP: ${otp}`); // Console log the unhashed OTP

        const order = new Order({
            buyerId: req.userId,
            sellerIds,
            itemIds,
            amount,
            hashedOtp
        });

        await order.save();

        // Create a corresponding "completed" dummy order
        const completedOrder = new Order({
            buyerId: req.userId,
            sellerIds,
            itemIds: [],
            amount,
            hashedOtp: '',
            pending: false,
            correspondingOrderId: order._id
        });

        await completedOrder.save();

        // Update the original order with the correspondingOrderId
        order.correspondingOrderId = completedOrder._id;
        await order.save();

        res.status(201).json({ order, unhashedOtp: otp });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Verify OTP
router.post('/verify-otp', authenticate, async (req, res) => {
    const { orderId, otp } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const sellerId = req.userId;
        const hashedOtp = order.hashedOtp;

        if (!hashedOtp) return res.status(400).json({ error: 'OTP not found for this seller' });

        const isMatch = await bcrypt.compare(otp, hashedOtp);
        if (isMatch) {
            // Move item to the completed order
            const completedOrder = await Order.findById(order.correspondingOrderId);
            const itemsToMove = await Promise.all(order.itemIds.map(async (itemId) => {
                const item = await Item.findOne({ itemId });
                return item.sellerId === sellerId ? itemId : null;
            }));
            completedOrder.itemIds.push(...itemsToMove.filter(itemId => itemId !== null));
            await completedOrder.save();

            // Remove item from the original order
            const itemsToKeep = await Promise.all(order.itemIds.map(async (itemId) => {
                const item = await Item.findOne({ itemId });
                return item.sellerId !== sellerId ? itemId : null;
            }));
            order.itemIds = itemsToKeep.filter(itemId => itemId !== null);
            await order.save();

            res.status(200).json({ message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ error: 'Invalid OTP' });
        }
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