// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const User = require('../models/User');
// const multer = require('multer');
// const path = require('path');
// const bcrypt = require('bcryptjs');
// const fs = require('fs');

// // Create uploads directory if it doesn't exist
// const uploadDir = 'uploads/profile-images';
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure multer for file upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueFilename = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
//         cb(null, uniqueFilename);
//     }
// });

// const fileFilter = function (req, file, cb) {
//     const filetypes = /jpeg|jpg|png/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     if (mimetype && extname) {
//         return cb(null, true);
//     }
//     cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
// };

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 5000000 }, // 5MB limit
//     fileFilter: fileFilter
// });

// // Error handling middleware for multer
// const handleMulterError = (err, req, res, next) => {
//     if (err instanceof multer.MulterError) {
//         if (err.code === 'LIMIT_FILE_SIZE') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'File size cannot exceed 5MB'
//             });
//         }
//     }
//     next(err);
// };

// // Get user profile
// router.get('/profile', authController.protect, async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id)
//             .select('-password -resetPasswordToken -resetPasswordExpire')
//             .lean();

//         if (!user) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'User not found'
//             });
//         }

//         res.json({
//             status: 'success',
//             data: user
//         });
//     } catch (err) {
//         console.error('Error fetching user profile:', err);
//         res.status(500).json({
//             status: 'error',
//             message: 'Error fetching user profile'
//         });
//     }
// });

// // Update user profile
// router.put('/update-profile', authController.protect, async (req, res) => {
//     try {
//         const {
//             userName,
//             phone,
//             address,
//             nation,
//             gender,
//             language,
//             specialization,
//             barCouncilNumber,
//             experience,
//             university,
//             semester,
//             studentId,
//             consultationPreference,
//             legalInterests
//         } = req.body;

//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'User not found'
//             });
//         }

//         // Basic validation
//         if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid phone number format'
//             });
//         }

//         // Update basic fields
//         if (userName) user.userName = userName;
//         if (phone) user.phone = phone;
//         if (address) user.address = address;
//         if (nation) user.nation = nation;
//         if (gender) user.gender = gender;
//         if (language) user.language = language;

//         // Update role-specific fields
//         if (user.profession === 'lawyer') {
//             if (specialization) user.specialization = specialization;
//             if (barCouncilNumber) {
//                 // Validate bar council number format
//                 if (!/^[A-Z]{2}\d{6}$/.test(barCouncilNumber)) {
//                     return res.status(400).json({
//                         status: 'error',
//                         message: 'Invalid bar council number format'
//                     });
//                 }
//                 user.barCouncilNumber = barCouncilNumber;
//             }
//             if (experience) user.experience = experience;
//         }
//         else if (user.profession === 'law_student') {
//             if (university) user.university = university;
//             if (semester) {
//                 // Validate semester
//                 if (!Number.isInteger(semester) || semester < 1 || semester > 10) {
//                     return res.status(400).json({
//                         status: 'error',
//                         message: 'Invalid semester number'
//                     });
//                 }
//                 user.semester = semester;
//             }
//             if (studentId) user.studentId = studentId;
//         }

//         if (consultationPreference) user.consultationPreference = consultationPreference;
//         if (legalInterests) user.legalInterests = legalInterests;

//         await user.save();

//         // Remove sensitive fields from response
//         const userResponse = user.toObject();
//         delete userResponse.password;
//         delete userResponse.resetPasswordToken;
//         delete userResponse.resetPasswordExpire;

//         res.json({
//             status: 'success',
//             data: userResponse
//         });
//     } catch (err) {
//         console.error('Error updating user profile:', err);
//         res.status(500).json({
//             status: 'error',
//             message: 'Error updating user profile'
//         });
//     }
// });

// // Upload profile picture
// router.post('/upload-profile-picture', authController.protect, upload.single('profilePicture'), handleMulterError, async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'No file uploaded'
//             });
//         }

//         const user = await User.findById(req.user.id);
//         if (!user) {
//             // Delete uploaded file if user not found
//             fs.unlinkSync(req.file.path);
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'User not found'
//             });
//         }

//         // Delete old profile picture if exists
//         if (user.profilePicture && fs.existsSync(user.profilePicture)) {
//             fs.unlinkSync(user.profilePicture);
//         }

//         user.profilePicture = req.file.path;
//         await user.save();

//         res.json({
//             status: 'success',
//             data: {
//                 profilePicture: user.profilePicture
//             }
//         });
//     } catch (err) {
//         console.error('Error uploading profile picture:', err);
//         // Delete uploaded file if error occurs
//         if (req.file && fs.existsSync(req.file.path)) {
//             fs.unlinkSync(req.file.path);
//         }
//         res.status(500).json({
//             status: 'error',
//             message: 'Error uploading profile picture'
//         });
//     }
// });

// // Change password
// router.put('/change-password', authController.protect, async (req, res) => {
//     try {
//         const { newPassword } = req.body;
//         if (!newPassword) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Please provide a new password'
//             });
//         }

//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'User not found'
//             });
//         }

//         // Hash the new password
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(newPassword, salt);

//         await user.save();
//         res.json({
//             status: 'success',
//             message: 'Password updated successfully'
//         });
//     } catch (err) {
//         console.error('Error changing password:', err);
//         res.status(500).json({
//             status: 'error',
//             message: 'Error changing password'
//         });
//     }
// });

// module.exports = router;

// Updated Profile
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profile-images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
});

const fileFilter = function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: 'File size cannot exceed 5MB'
            });
        }
    }
    next(err);
};

// Get user profile
router.get('/profile', authController.protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -resetPasswordToken -resetPasswordExpire')
            .lean();

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: user
        });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user profile'
        });
    }
});

// Update user profile
router.put('/update-profile', authController.protect, async (req, res) => {
    try {
        const {
            userName,
            phone,
            address,
            nation,
            gender,
            language,
            specialization,
            barCouncilNumber,
            experience,
            university,
            semester,
            studentId,
            consultationPreference,
            legalInterests
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Basic validation
        if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid phone number format'
            });
        }

        // Update basic fields
        if (userName) user.userName = userName;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (nation) user.nation = nation;
        if (gender) user.gender = gender;
        if (language) user.language = language;

        // Update role-specific fields
        if (user.profession === 'lawyer') {
            if (specialization) user.specialization = specialization;
            if (barCouncilNumber) {
                // Validate bar council number format
                if (!/^[A-Z]{2}\d{6}$/.test(barCouncilNumber)) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Invalid bar council number format'
                    });
                }
                user.barCouncilNumber = barCouncilNumber;
            }
            if (experience) user.experience = experience;
        }
        else if (user.profession === 'law_student') {
            if (university) user.university = university;
            if (semester) {
                // Validate semester
                if (!Number.isInteger(semester) || semester < 1 || semester > 10) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Invalid semester number'
                    });
                }
                user.semester = semester;
            }
            if (studentId) user.studentId = studentId;
        }

        if (consultationPreference) user.consultationPreference = consultationPreference;
        if (legalInterests) user.legalInterests = legalInterests;

        await user.save();

        // Remove sensitive fields from response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpire;

        res.json({
            status: 'success',
            data: userResponse
        });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user profile'
        });
    }
});

// Upload profile picture
router.post('/upload-profile-picture', authController.protect, upload.single('profilePicture'), handleMulterError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Delete old profile picture if exists
        if (user.profilePicture && user.profilePicture !== 'default.jpg' && fs.existsSync(path.join(__dirname, '..', 'public', user.profilePicture))) {
            fs.unlinkSync(path.join(__dirname, '..', 'public', user.profilePicture));
        }

        // Store the path relative to /uploads for proper URL resolution
        const relativePath = path.join('uploads', 'profile-images', path.basename(req.file.path)).replace(/\\/g, '/');
        user.profilePicture = relativePath;
        await user.save();

        res.json({
            status: 'success',
            data: {
                profilePicture: relativePath
            }
        });
    } catch (err) {
        console.error('Error uploading profile picture:', err);
        // Delete uploaded file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            status: 'error',
            message: 'Error uploading profile picture'
        });
    }
});

// Change password
router.put('/change-password', authController.protect, async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide a new password'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({
            status: 'error',
            message: 'Error changing password'
        });
    }
});

module.exports = router;