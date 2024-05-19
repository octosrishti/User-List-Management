// models/list.js
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    customProperties: [{
        title: String,
        fallbackValue: String
    }]
});

module.exports = mongoose.model('List', listSchema);
