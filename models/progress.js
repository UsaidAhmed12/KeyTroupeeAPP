const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    username: { type: String, required: true },
    wpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    mistakes: { type: Number, required: true },
    difficulty: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);