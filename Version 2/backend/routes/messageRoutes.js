const express = require('express');
const router = express.Router();
const { 
    getMessages, 
    getMyMessages, 
    createMessage, 
    answerMessage, 
    rateAnswer 
} = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

// Input validation middleware
const validateMessageInput = (req, res, next) => {
    const { content, subject } = req.body;
    if (!content || !subject) {
        return res.status(400).json({
            status: 'error',
            message: 'Content and subject are required'
        });
    }
    if (typeof content !== 'string' || content.length < 10) {
        return res.status(400).json({
            status: 'error',
            message: 'Content must be at least 10 characters long'
        });
    }
    next();
};

const validateAnswerInput = (req, res, next) => {
    const { answer } = req.body;
    if (!answer || typeof answer !== 'string' || answer.length < 10) {
        return res.status(400).json({
            status: 'error',
            message: 'Answer must be at least 10 characters long'
        });
    }
    next();
};

const validateRatingInput = (req, res, next) => {
    const { rating } = req.body;
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
            status: 'error',
            message: 'Rating must be an integer between 1 and 5'
        });
    }
    next();
};

// Create a new message
router.post('/', 
    auth.protect, 
    validateMessageInput,
    createMessage
);

// Get all messages (paginated and filtered)
router.get('/', 
    auth.protect,
    getMessages
);

// Get user's messages (paginated and filtered)
router.get('/my-messages', 
    auth.protect,
    getMyMessages
);

// Answer a message (lawyers only)
router.post('/:id/answer', 
    auth.protect,
    auth.checkRole('lawyer'),
    validateAnswerInput,
    answerMessage
);

// Rate an answer
router.post('/:id/rate', 
    auth.protect,
    validateRatingInput,
    rateAnswer
);

module.exports = router;
