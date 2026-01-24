const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getStats, getAllUsers, deleteUser, verifyUser } = require('../controllers/adminController');

// All routes are protected and require 'admin' role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/verify', verifyUser);

module.exports = router;
