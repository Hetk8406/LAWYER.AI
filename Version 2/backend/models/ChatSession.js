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

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [messageSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Update lastUpdated timestamp on save
chatSessionSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
