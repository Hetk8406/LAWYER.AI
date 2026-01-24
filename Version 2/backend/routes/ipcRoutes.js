const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
    searchIPCController,
    getAllIPC,
    createIPC,
    updateIPC,
    deleteIPC
} = require('../controllers/ipcController');

const router = express.Router();

// Public/Protected User Routes
router.get('/search', protect, searchIPCController);
router.get('/', protect, getAllIPC); // List all

// Admin Routes
router.post('/', protect, restrictTo('admin'), createIPC);
router.put('/:id', protect, restrictTo('admin'), updateIPC);
router.delete('/:id', protect, restrictTo('admin'), deleteIPC);

module.exports = router;
