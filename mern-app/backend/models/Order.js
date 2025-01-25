const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
    transactionId: { type: String, default: uuidv4, unique: true },
    buyerId: { type: String, required: true },
    sellerIds: { type: [String], required: true },
    itemIds: { type: [String], required: true },
    amount: { type: Number, required: true },
    hashedOtp: { type: Map, of: String, required: true },
    pending: { type: Boolean, default: true }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
