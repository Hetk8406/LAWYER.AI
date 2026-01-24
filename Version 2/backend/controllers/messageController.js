const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all messages or filtered by category
// @route   GET /api/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Add category filter if provided
    if (req.query.category && req.query.category !== 'all') {
        query.category = req.query.category;
    }
    
    // Add search filter if provided
    if (req.query.search) {
        query.content = { $regex: req.query.search, $options: 'i' };
    }
    
    // If user is not a lawyer, only show their messages
    if (req.user.role !== 'lawyer') {
        query.sender = req.user._id;
    }

    const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name role')
        .populate('answer.answeredBy', 'name role specialty');

    const total = await Message.countDocuments(query);

    res.json({
        success: true,
        data: messages,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get messages for a specific user
// @route   GET /api/messages/my-messages
// @access  Private
const getMyMessages = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = { sender: req.user._id };
    
    // Add category filter if provided
    if (req.query.category && req.query.category !== 'all') {
        query.category = req.query.category;
    }
    
    // Add search filter if provided
    if (req.query.search) {
        query.content = { $regex: req.query.search, $options: 'i' };
    }

    const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name role')
        .populate('answer.answeredBy', 'name role specialty');

    const total = await Message.countDocuments(query);

    res.json({
        success: true,
        data: messages,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
const createMessage = asyncHandler(async (req, res) => {
    const { content, category } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Please provide message content');
    }

    const message = await Message.create({
        content,
        category: category || 'General',
        sender: req.user._id,
        status: 'pending'
    });

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name role')
        .populate('answer.answeredBy', 'name role specialty');

    res.status(201).json({
        success: true,
        data: populatedMessage
    });
});

// @desc    Answer a message
// @route   POST /api/messages/:id/answer
// @access  Private (Lawyers only)
const answerMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    if (req.user.role !== 'lawyer') {
        res.status(403);
        throw new Error('Only lawyers can answer messages');
    }

    if (message.isAnswered) {
        res.status(400);
        throw new Error('Message has already been answered');
    }

    message.answer = {
        content: req.body.content,
        answeredBy: req.user._id,
        answeredAt: Date.now(),
        rating: 0
    };
    message.isAnswered = true;
    message.status = 'answered';

    await message.save();

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name role')
        .populate('answer.answeredBy', 'name role specialty');

    res.json({
        success: true,
        data: populatedMessage
    });
});

// @desc    Rate an answer
// @route   POST /api/messages/:id/rate
// @access  Private
const rateAnswer = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    if (!message.isAnswered) {
        res.status(400);
        throw new Error('Message has not been answered yet');
    }

    if (message.sender.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the message sender can rate the answer');
    }

    const rating = parseInt(req.body.rating);
    if (![1, -1].includes(rating)) {
        res.status(400);
        throw new Error('Rating must be either 1 (helpful) or -1 (not helpful)');
    }

    message.answer.rating = rating;
    await message.save();

    res.json({
        success: true,
        data: { rating }
    });
});

// @desc    Get online lawyers
// @route   GET /api/users/lawyers/online
// @access  Private
const getOnlineLawyers = asyncHandler(async (req, res) => {
    const onlineLawyers = await User.find({
        role: 'lawyer',
        lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Online in last 5 minutes
    }).select('name role specialty lastActive');

    res.json({
        success: true,
        data: onlineLawyers
    });
});

module.exports = {
    getMessages,
    getMyMessages,
    createMessage,
    answerMessage,
    rateAnswer,
    getOnlineLawyers
};
