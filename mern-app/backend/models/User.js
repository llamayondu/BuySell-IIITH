const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    userId: { type: String, default: uuidv4, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    itemsInCart: { type: Array, default: null },
    sellerReviews: { type: Array, default: null }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
