const express = require('express');
const router = express.Router();
const { getOnlineLawyers } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

// Get online lawyers
router.get('/lawyers/online', auth.protect, getOnlineLawyers);

module.exports = router;
