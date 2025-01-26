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

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // console.log("Generated token: ", token); // Debugging statement
        res.json({ token });
    } catch (err) {
        // console.error("Error during login: ", err); // Debugging statement
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

// PUT: Add item to cart
router.put('/me/cart/add', authenticate, async (req, res) => {
    const { itemId } = req.body;
    try {
        console.log('Adding item to cart:', itemId); // Debugging statement
        const user = await User.findById(req.userId);
        if (!user) {
            console.error('User not found:', req.userId); // Debugging statement
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User found:', user); // Debugging statement
        if (!user.itemsInCart) {
            user.itemsInCart = [];
        }
        user.itemsInCart.push(itemId);
        await user.save();
        console.log('Updated user:', user); // Debugging statement
        res.json(user);
    } catch (err) {
        console.error('Error adding item to cart:', err); // Debugging statement
        res.status(500).json({ error: err.message });
    }
});

// PUT: Remove item from cart
router.put('/me/cart/remove', authenticate, async (req, res) => {
    const { itemId } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.userId, {
            $pull: { itemsInCart: itemId }
        }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Clear user's cart
// router.put('/me/cart/clear', authenticate, async (req, res) => {
//     console.log('Received request to clear cart'); // Debug statement
//     console.log('User ID:', req.userId); // Debug statement
//     try {
//         const user = await User.findOne({ userId: req.userId });
//         if (!user) {
//             console.error('User not found'); // Debug statement
//             return res.status(404).send('User not found');
//         }
//         console.log('Items in cart before clearing:', user.itemsInCart); // Debug statement

//         await User.updateOne({ userId: req.userId }, { $set: { itemsInCart: [] } });

//         const updatedUser = await User.findOne({ userId: req.userId });
//         console.log('Items in cart after clearing:', updatedUser.itemsInCart); // Debug statement

//         console.log('Cart cleared successfully in database'); // Debug statement
//         res.status(200).send('Cart cleared successfully');
//     } catch (err) {
//         console.error('Error clearing cart:', err);
//         res.status(500).send('Failed to clear cart');
//     }
// });

// PUT: Clear user's cart
router.put('/me/cart/clear', authenticate, async (req, res) => {
    const { itemId } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.userId, {
            $set: { itemsInCart: [] }
        }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Fetch sellers by their IDs
router.post('/sellers', authenticate, async (req, res) => {
    const { sellerIds } = req.body;
    try {
        const sellers = await User.find({ _id: { $in: sellerIds } });
        res.json(sellers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
