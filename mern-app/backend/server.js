const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/auth-check', (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));