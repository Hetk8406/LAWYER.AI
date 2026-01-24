const express = require('express');
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'profile-images');
        // Create directory if it doesn't exist
        require('fs').mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Use user ID in filename for better organization
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only .jpeg, .jpg and .png files are allowed!'));
        }
    }
});

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleLoginFixed);
router.get('/verify/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/logout', authController.logout);

// Phone verification routes
router.post('/send-verification', authController.sendVerification);
router.post('/verify-otp', authController.verifyOTP);

// Protected routes
router.use(authController.protect); // Apply protect middleware to all routes below

router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.updatePassword);
router.post('/upload-profile-image', upload.single('profileImage'), authController.uploadProfileImage);
router.delete('/delete-profile-image', authController.deleteProfileImage);

module.exports = router;
