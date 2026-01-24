const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public route for submitting contact form
router.post('/submit', contactController.submitContact);

// Protected route for retrieving contact submissions (admin and lawyer only)
router.get('/submissions',
  protect,
  restrictTo('admin', 'lawyer'),
  contactController.getContactSubmissions
);

router.patch('/:id/status',
  protect,
  restrictTo('admin'),
  contactController.updateStatus
);

router.delete('/:id',
  protect,
  restrictTo('admin'),
  contactController.deleteContact
);

module.exports = router;
