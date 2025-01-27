const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const itemSchema = new mongoose.Schema({
    itemId: { type: String, default: uuidv4, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    sellerId: { type: String, required: true },
    boughtBy: { type: String, default: null } // Add boughtBy field
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;