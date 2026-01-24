const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (Read only)
router.get('/', blogController.getAllPosts);
router.get('/:id', blogController.getPost);

// Protected routes
router.use(protect); // All routes below this are protected

router.post('/create-blog', blogController.createPost);
router.patch('/:id', blogController.updatePost);
router.delete('/:id', blogController.deletePost);
router.post('/:id/comments', blogController.addComment);

module.exports = router;
