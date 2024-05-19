// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    city: {
        type: String,
        default: 'Unknown'
    },
    unsubscribed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);
