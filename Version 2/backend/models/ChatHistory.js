const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One history per user for this simple implementation
    },
    messages: [messageSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated timestamp on save
chatHistorySchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
