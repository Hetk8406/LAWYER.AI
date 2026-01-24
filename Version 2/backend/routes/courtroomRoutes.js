const express = require('express');
const router = express.Router();
const courtroomController = require('../controllers/courtroomController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes protected

// READ
router.get('/:userId/contacts', courtroomController.getUserContacts);
router.get('/:userId/messages', courtroomController.getUserMessages);

// CREATE
router.post('/:userId/message', courtroomController.postUserMessage);
router.post('/:userId/room', courtroomController.postRoom);

// UPDATE
router.put('/:userId/messages/status', courtroomController.updateMessageReadStatus);

module.exports = router;
