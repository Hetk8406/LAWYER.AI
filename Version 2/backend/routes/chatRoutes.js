const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getSessions, getSession, deleteSession, createSession } = require('../controllers/chatController');

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/sessions', protect, getSessions);
router.get('/session/:sessionId', protect, getSession);
router.delete('/session/:sessionId', protect, deleteSession);
router.post('/session', protect, createSession);

module.exports = router;
