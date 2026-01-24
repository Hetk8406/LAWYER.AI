// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const User = require('../models/User');
// const emailService = require('../services/emailService');
// const { client, TWILIO_SERVICE_SID } = require('../config/twilio');

// const signToken = (id, expiresIn = process.env.JWT_EXPIRES_IN) => {
//   return jwt.sign(
//     { id }, 
//     process.env.ACCESS_TOKEN_SECRET, 
//     { expiresIn }
//   );
// };

// const createSendToken = async (user, statusCode, res) => {
//   const token = signToken(user._id);

//   // Remove sensitive data
//   user.password = undefined;
//   user.verificationToken = undefined;
//   user.verificationTokenExpires = undefined;
//   user.phoneVerified = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: { user }
//   });
// };

// // exports.signup = async (req, res) => {
// //   console.log('Signup request body:', req.body);
// //   try {
// //     const userData = {
// //       name: req.body.name,
// //       email: req.body.email,
// //       password: req.body.password,
// //       role: req.body.role,
// //       phone: req.body.phone,
// //       verified: false,
// //       phoneVerified: false // Set default to false
// //     };

// //     // Check if email already exists
// //     const existingUser = await User.findOne({ email: req.body.email });
// //     if (existingUser) {
// //       return res.status(400).json({
// //         status: 'error',
// //         message: 'This email is already registered. Please use a different email or try logging in.'
// //       });
// //     }

// //     // Check if phone number is already registered
// //     const existingPhoneUser = await User.findOne({ phone: req.body.phone });
// //     if (existingPhoneUser) {
// //       return res.status(400).json({
// //         status: 'error',
// //         message: 'This phone number is already registered. Please use a different phone number.'
// //       });
// //     }

// //     // Add role-specific fields
// //     if (req.body.role === 'lawyer') {
// //       if (!req.body.specialization || !req.body.barCouncilId || !req.body.experience) {
// //         return res.status(400).json({
// //           status: 'error',
// //           message: 'Please provide all required lawyer information'
// //         });
// //       }
// //       userData.specialization = req.body.specialization;
// //       userData.barCouncilId = req.body.barCouncilId;
// //       userData.experience = req.body.experience;
// //     }

// //     if (req.body.role === 'law_student') {
// //       if (!req.body.universityName || !req.body.studentId || !req.body.yearOfStudy) {
// //         return res.status(400).json({
// //           status: 'error',
// //           message: 'Please provide all required law student information'
// //         });
// //       }
// //       userData.universityName = req.body.universityName;
// //       userData.studentId = req.body.studentId;
// //       userData.yearOfStudy = req.body.yearOfStudy;
// //     }

// //     const newUser = await User.create(userData);

// //     // Send verification email
// //     await emailService.sendVerificationEmail(
// //       newUser.email,
// //       newUser.name
// //     );

// //     res.status(201).json({
// //       status: 'success',
// //       message: 'User created successfully. Please check your email to verify your account.',
// //       data: {
// //         user: {
// //           name: newUser.name,
// //           email: newUser.email,
// //           phone: newUser.phone,
// //           role: newUser.role
// //         }
// //       }
// //     });
// //   } catch (err) {
// //     console.error('Signup error:', err);
// //     res.status(400).json({
// //       status: 'error',
// //       message: err.message
// //     });
// //   }
// // };

// exports.signup = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       confirmPassword,
//       phoneNumber,
//       role,
//       specialization,
//       experience,
//       barCouncilId,
//       universityName,
//       studentId,
//       yearOfStudy,
//       phoneVerified
//     } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'User with this email already exists'
//       });
//     }

//     // Create verification token
//     const verificationToken = crypto.randomBytes(32).toString('hex');

//     // Create new user
//     const newUser = await User.create({
//       name,
//       email,
//       password,
//       phone: phoneNumber,
//       role,
//       specialization: role === 'lawyer' ? specialization : undefined,
//       experience: role === 'lawyer' ? experience : undefined,
//       barCouncilId: role === 'lawyer' ? barCouncilId : undefined,
//       universityName: role === 'law_student' ? universityName : undefined,
//       studentId: role === 'law_student' ? studentId : undefined,
//       yearOfStudy: role === 'law_student' ? yearOfStudy : undefined,
//       verificationToken,
//       phoneVerified,
//       verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
//     });

//     // Send verification email
//     await emailService.sendVerificationEmail(
//       newUser.email,
//       newUser.name,
//       verificationToken
//     );

//     // Create and send token
//     createSendToken(newUser, 201, res);
//   } catch (err) {
//     console.error('Signup error:', err);
//     res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if email and password exist
//     if (!email || !password) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Please provide email and password'
//       });
//     }

//     // Check if user exists && password is correct
//     const user = await User.findOne({ email }).select('+password');

//     if (!user || !(await user.correctPassword(password))) {
//       return res.status(401).json({
//         status: 'error',
//         message: 'Incorrect email or password'
//       });
//     }

//     // Check if email is verified
//     if (!user.verified) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'Please verify your email before logging in',
//         email: user.email,
//         requiresVerification: true
//       });
//     }

//     // Check if phone is verified
//     if (!user.phoneVerified) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'Please verify your phone number before logging in',
//         phone: user.phone,
//         requiresPhoneVerification: true
//       });
//     }

//     createSendToken(user, 200, res);
//   } catch (err) {
//     res.status(400).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// };

// exports.logout = async (req, res) => {
//   try {
//     const user = req.user;

//     res.status(200).json({
//       status: 'success',
//       message: 'Logged out successfully'
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       message: 'Error logging out'
//     });
//   }
// };

// exports.protect = async (req, res, next) => {
//   try {
//     // Get token
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (!token) {
//       return res.status(401).json({
//         status: 'error',
//         message: 'You are not logged in. Please log in to get access.'
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     // Check if user still exists
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({
//         status: 'error',
//         message: 'The user belonging to this token no longer exists.'
//       });
//     }

//     // Grant access to protected route
//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({
//       status: 'error',
//       message: 'Invalid token. Please log in again.'
//     });
//   }
// };

// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         user
//       }
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// };

// exports.updateProfile = async (req, res) => {
//   try {
//     // Only allow updating specific fields
//     const updates = {};
//     const allowedFields = ['name', 'phone', 'address', 'nation', 'gender', 'language', 'dob'];

//     // Add allowed fields if they exist in request body
//     allowedFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     });

//     // Handle lawyer-specific updates
//     if (req.user.role === 'lawyer') {
//       if (req.body.experience !== undefined) {
//         if (req.body.experience < 0) {
//           return res.status(400).json({
//             status: 'error',
//             message: 'Experience cannot be negative'
//           });
//         }
//         updates.experience = req.body.experience;
//       }

//       if (req.body.specialization) {
//         if (!['Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law', 'Property Law', 'Immigration Law', 'General Practice'].includes(req.body.specialization)) {
//           return res.status(400).json({
//             status: 'error',
//             message: 'Invalid specialization'
//           });
//         }
//         updates.specialization = req.body.specialization;
//       }

//       if (req.body.barCouncilId) {
//         // Validate Bar Council ID format
//         const barCouncilIdPattern = /^[A-Z]{2}\d{5,6}(\/\d{4})?$/;
//         if (!barCouncilIdPattern.test(req.body.barCouncilId)) {
//           return res.status(400).json({
//             status: 'error',
//             message: 'Invalid Bar Council ID format'
//           });
//         }
//         updates.barCouncilId = req.body.barCouncilId;
//       }
//     }

//     // Handle law student-specific updates
//     if (req.user.role === 'law_student') {
//       if (req.body.universityName !== undefined) {
//         updates.universityName = req.body.universityName;
//       }
//       if (req.body.yearOfStudy !== undefined) {
//         if (req.body.yearOfStudy < 1 || req.body.yearOfStudy > 5) {
//           return res.status(400).json({
//             status: 'error',
//             message: 'Year of study must be between 1 and 5'
//           });
//         }
//         updates.yearOfStudy = req.body.yearOfStudy;
//       }
//       if (req.body.studentId !== undefined) {
//         updates.studentId = req.body.studentId;
//       }
//     }

//     // Validate phone number format if provided
//     if (updates.phone) {
//       const phonePattern = /^\+\d+$/;
//       if (!phonePattern.test(updates.phone)) {
//         return res.status(400).json({
//           status: 'error',
//           message: 'Phone number must be in international format (e.g., +917984849841)'
//         });
//       }
//     }

//     // Update user with validated fields
//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       updates,
//       {
//         new: true,
//         runValidators: true
//       }
//     );

//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user
//       }
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// };

// exports.updatePassword = async (req, res) => {
//   try {
//     // Get user from collection
//     const user = await User.findById(req.user.id).select('+password');

//     // Check if posted current password is correct
//     if (!(await user.correctPassword(req.body.currentPassword))) {
//       return res.status(401).json({
//         status: 'error',
//         message: 'Your current password is wrong'
//       });
//     }

//     // Update password
//     user.password = req.body.newPassword;
//     await user.save();

//     // Log user in, send JWT
//     createSendToken(user, 200, res);
//   } catch (err) {
//     res.status(400).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// };

// // Verify email
// exports.verifyEmail = async (req, res) => {
//   try {
//     let token = req.params.token;
//     console.log('Verification attempt with token:', token);

//     if (!token) {
//       console.log('No token provided');
//       return res.status(400).json({
//         status: 'fail',
//         message: 'No verification token provided'
//       });
//     }

//     // Clean the token by removing any colon prefix
//     token = token.replace(/^:/, '');

//     // Find user with this verification token
//     const user = await User.findOne({ verificationToken: token })
//       .select('+verificationToken +verificationTokenExpires');

//     console.log('User lookup result:', user ? {
//       email: user.email,
//       verified: user.verified,
//       tokenExpires: user.verificationTokenExpires,
//       verificationTokenExpires: { $gt: Date.now() },
//       hasToken: !!user.verificationToken
//     } : 'No user found');

//     if (!user) {
//       let email;
//       try {
//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         email = decoded.email;
//       } catch (e) {
//         console.log('Token is not a valid JWT:', e.message);
//       }

//       if (email) {
//         const verifiedUser = await User.findOne({ email, verified: true });
//         if (verifiedUser) {
//           return res.status(200).json({
//             status: 'success',
//             message: 'Email is already verified. You can now log in.',
//             data: {
//               verified: true,
//               email: verifiedUser.email
//             }
//           });
//         }
//       }

//       return res.status(400).json({
//         status: 'fail',
//         message: 'Token is invalid or has expired. Please request a new verification email.'
//       });
//     }

//     // Double check if already verified
//     if (user.verified && !user.verificationToken) {
//       console.log('User already verified:', user.email);
//       return res.status(200).json({
//         status: 'success',
//         message: 'Email is already verified. You can now log in.',
//         data: {
//           verified: true,
//           email: user.email
//         }
//       });
//     }

//     // Check token expiration with a small buffer time (5 seconds)
//     const bufferTime = 5000; // 5 seconds
//     if (user.verificationTokenExpires && 
//         user.verificationTokenExpires.getTime() < Date.now() - bufferTime) {
//       console.log('Token expired for user:', user.email);

//       // Clear expired token
//       user.verificationToken = undefined;
//       user.verificationTokenExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       return res.status(400).json({
//         status: 'fail',
//         message: 'Verification token has expired. Please request a new one.',
//         expired: true
//       });
//     }

//     // Update user verification status
//     user.verified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     console.log('User verified successfully:', user.email);

//     // Try to send welcome email, but don't fail if it doesn't work
//     try {
//       await emailService.sendWelcomeEmail(user.email, user.name, user.role);
//       console.log('Welcome email sent to:', user.email);
//     } catch (emailError) {
//       console.error('Welcome email error:', emailError);
//     }

//     // Return success response
//     res.status(200).json({
//       status: 'success',
//       message: 'Email verified successfully',
//       data: {
//         verified: true,
//         email: user.email
//       }
//     });
//   } catch (err) {
//     console.error('Verification error:', err);
//     res.status(500).json({
//       status: 'error',
//       message: 'An error occurred during verification. Please try again.'
//     });
//   }
// };

// exports.resendVerification = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Please provide an email address'
//       });
//     }

//     // Find user and include verification fields
//     const user = await User.findOne({ email })
//       .select('+verificationToken +verificationTokenExpires');

//     if (!user) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'No user found with this email address'
//       });
//     }

//     if (user.verified) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Email is already verified'
//       });
//     }

//     // Create new verification token
//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     user.verificationToken = verificationToken;
//     user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
//     await user.save({ validateBeforeSave: false });

//     // Send verification email
//     await emailService.sendVerificationEmail(
//       user.email,
//       user.name,
//       verificationToken
//     );

//     res.status(200).json({
//       status: 'success',
//       message: 'Verification email sent successfully'
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };

// // Send verification code
// exports.sendVerification = async (req, res) => {
//     const { phone } = req.body;

//     try {
//         const verification = await client.verify
//             .services(TWILIO_SERVICE_SID)
//             .verifications
//             .create({
//                 to: phone,
//                 channel: 'sms'
//             });

//         res.status(200).json({
//             success: true,
//             message: 'Verification code sent successfully',
//             payload: {
//                 status: verification.status
//             }
//         });
//     } catch (error) {
//         console.error('Twilio verification error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error sending verification code'
//         });
//     }
// };

// // Verify OTP
// exports.verifyOTP = async (req, res) => {
//     const { phone, otp } = req.body;

//     try {
//         const verificationCheck = await client.verify
//             .services(TWILIO_SERVICE_SID)
//             .verificationChecks
//             .create({
//                 to: phone,
//                 code: otp
//             });

//         if (verificationCheck.status === 'approved') {
//             res.status(200).json({
//                 success: true,
//                 message: 'Phone number verified successfully'
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid verification code'
//             });
//         }
//     } catch (error) {
//         console.error('Twilio verification check error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error verifying code'
//         });
//     }
// };

// // Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // Update user's profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: `/uploads/profile-images/${req.file.filename}` },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user,
        profilePicture: `/uploads/profile-images/${req.file.filename}`
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message || 'Failed to update profile picture'
    });
  }
};

// Delete profile image
exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Optional: Delete the actual file from filesystem if needed
    // but for now we just remove the reference from DB

    user.profilePicture = undefined; // or null
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Profile picture removed successfully',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message || 'Failed to remove profile picture'
    });
  }
};

// Updated Profile

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { client, TWILIO_SERVICE_SID } = require('../config/twilio');

const signToken = (id, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(
    { id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn }
  );
};

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove sensitive data
  user.password = undefined;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.phoneVerified = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

// exports.signup = async (req, res) => {
//   console.log('Signup request body:', req.body);
//   try {
//     const userData = {
//       name: req.body.name,
//       email: req.body.email,
//       password: req.body.password,
//       role: req.body.role,
//       phone: req.body.phone,
//       verified: false,
//       phoneVerified: false // Set default to false
//     };

//     // Check if email already exists
//     const existingUser = await User.findOne({ email: req.body.email });
//     if (existingUser) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'This email is already registered. Please use a different email or try logging in.'
//       });
//     }

//     // Check if phone number is already registered
//     const existingPhoneUser = await User.findOne({ phone: req.body.phone });
//     if (existingPhoneUser) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'This phone number is already registered. Please use a different phone number.'
//       });
//     }

//     // Add role-specific fields
//     if (req.body.role === 'lawyer') {
//       if (!req.body.specialization || !req.body.barCouncilId || !req.body.experience) {
//         return res.status(400).json({
//           status: 'error',
//           message: 'Please provide all required lawyer information'
//         });
//       }
//       userData.specialization = req.body.specialization;
//       userData.barCouncilId = req.body.barCouncilId;
//       userData.experience = req.body.experience;
//     }

//     if (req.body.role === 'law_student') {
//       if (!req.body.universityName || !req.body.studentId || !req.body.yearOfStudy) {
//         return res.status(400).json({
//           status: 'error',
//           message: 'Please provide all required law student information'
//         });
//       }
//       userData.universityName = req.body.universityName;
//       userData.studentId = req.body.studentId;
//       userData.yearOfStudy = req.body.yearOfStudy;
//     }

//     const newUser = await User.create(userData);

//     // Send verification email
//     await emailService.sendVerificationEmail(
//       newUser.email,
//       newUser.name
//     );

//     res.status(201).json({
//       status: 'success',
//       message: 'User created successfully. Please check your email to verify your account.',
//       data: {
//         user: {
//           name: newUser.name,
//           email: newUser.email,
//           phone: newUser.phone,
//           role: newUser.role
//         }
//       }
//     });
//   } catch (err) {
//     console.error('Signup error:', err);
//     res.status(400).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// };

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      role,
      specialization,
      experience,
      barCouncilId,
      universityName,
      studentId,
      yearOfStudy,
      phoneVerified
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User with this email already exists. Please log in.'
      });
    }

    // Create new user (Phone is now optional at signup)
    const newUser = await User.create({
      name,
      email,
      password,
      phone: phoneNumber || undefined, // Allow empty phone
      role,
      specialization: role === 'lawyer' ? specialization : undefined,
      experience: role === 'lawyer' ? experience : undefined,
      barCouncilId: role === 'lawyer' ? barCouncilId : undefined,
      universityName: role === 'law_student' ? universityName : undefined,
      studentId: role === 'law_student' ? studentId : undefined,
      yearOfStudy: role === 'law_student' ? yearOfStudy : undefined,
      verificationToken: undefined, // No verification token needed
      verified: true, // Auto-verify email
      phoneVerified: false,
      verificationTokenExpires: undefined
    });

    // Verification email removed as per request

    // Create and send token
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // Check if email is verified (Now usually true by default)
    /* 
    if (!user.verified && user.role !== 'admin') {
      return res.status(401).json({
        status: 'fail',
        message: 'Please verify your email before logging in',
        email: user.email,
        requiresVerification: true
      });
    }
    */

    // Removed phone verification check on login to allow them to reach profile page
    // if (!user.phoneVerified && user.role !== 'admin') { ... }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error logging out'
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    // Get token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Only allow updating specific fields
    const updates = {};
    const allowedFields = ['name', 'phone', 'address', 'nation', 'gender', 'language', 'dob'];

    // Add allowed fields if they exist in request body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Auto-verify phone if provided/updated
    if (updates.phone) {
      updates.phoneVerified = true;
    }

    // Handle lawyer-specific updates
    if (req.user.role === 'lawyer') {
      if (req.body.experience !== undefined) {
        if (req.body.experience < 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Experience cannot be negative'
          });
        }
        updates.experience = req.body.experience;
      }

      if (req.body.specialization) {
        if (!['Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law', 'Property Law', 'Immigration Law', 'General Practice'].includes(req.body.specialization)) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid specialization'
          });
        }
        updates.specialization = req.body.specialization;
      }

      if (req.body.barCouncilId) {
        // Validate Bar Council ID format
        const barCouncilIdPattern = /^[A-Z]{2}\d{5,6}(\/\d{4})?$/;
        if (!barCouncilIdPattern.test(req.body.barCouncilId)) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid Bar Council ID format'
          });
        }
        updates.barCouncilId = req.body.barCouncilId;
      }
    }

    // Handle law student-specific updates
    if (req.user.role === 'law_student') {
      if (req.body.universityName !== undefined) {
        updates.universityName = req.body.universityName;
      }
      if (req.body.yearOfStudy !== undefined) {
        if (req.body.yearOfStudy < 1 || req.body.yearOfStudy > 5) {
          return res.status(400).json({
            status: 'error',
            message: 'Year of study must be between 1 and 5'
          });
        }
        updates.yearOfStudy = req.body.yearOfStudy;
      }
      if (req.body.studentId !== undefined) {
        updates.studentId = req.body.studentId;
      }
    }

    // Validate phone number format if provided
    if (updates.phone) {
      const phonePattern = /^\+\d+$/;
      if (!phonePattern.test(updates.phone)) {
        return res.status(400).json({
          status: 'error',
          message: 'Phone number must be in international format (e.g., +917984849841)'
        });
      }
    }

    // Update user with validated fields
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // Check if posted current password is correct
    if (!(await user.correctPassword(req.body.currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Your current password is wrong'
      });
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    let token = req.params.token;
    console.log('Verification attempt with token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(400).json({
        status: 'fail',
        message: 'No verification token provided'
      });
    }

    // Clean the token by removing any colon prefix
    token = token.replace(/^:/, '');

    // Find user with this verification token
    const user = await User.findOne({ verificationToken: token })
      .select('+verificationToken +verificationTokenExpires');

    console.log('User lookup result:', user ? {
      email: user.email,
      verified: user.verified,
      tokenExpires: user.verificationTokenExpires,
      verificationTokenExpires: { $gt: Date.now() },
      hasToken: !!user.verificationToken
    } : 'No user found');

    if (!user) {
      let email;
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        email = decoded.email;
      } catch (e) {
        console.log('Token is not a valid JWT:', e.message);
      }

      if (email) {
        const verifiedUser = await User.findOne({ email, verified: true });
        if (verifiedUser) {
          return res.status(200).json({
            status: 'success',
            message: 'Email is already verified. You can now log in.',
            data: {
              verified: true,
              email: verifiedUser.email
            }
          });
        }
      }

      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired. Please request a new verification email.'
      });
    }

    // Double check if already verified
    if (user.verified && !user.verificationToken) {
      console.log('User already verified:', user.email);
      return res.status(200).json({
        status: 'success',
        message: 'Email is already verified. You can now log in.',
        data: {
          verified: true,
          email: user.email
        }
      });
    }

    // Check token expiration with a small buffer time (5 seconds)
    const bufferTime = 5000; // 5 seconds
    if (user.verificationTokenExpires &&
      user.verificationTokenExpires.getTime() < Date.now() - bufferTime) {
      console.log('Token expired for user:', user.email);

      // Clear expired token
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        status: 'fail',
        message: 'Verification token has expired. Please request a new one.',
        expired: true
      });
    }

    // Update user verification status
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log('User verified successfully:', user.email);

    // Try to send welcome email, but don't fail if it doesn't work
    try {
      await emailService.sendWelcomeEmail(user.email, user.name, user.role);
      console.log('Welcome email sent to:', user.email);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
      data: {
        verified: true,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during verification. Please try again.'
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an email address'
      });
    }

    // Find user and include verification fields
    const user = await User.findOne({ email })
      .select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with this email address'
      });
    }

    if (user.verified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already verified'
      });
    }

    // Create new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save({ validateBeforeSave: false });

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Send verification code
exports.sendVerification = async (req, res) => {
  const { phone } = req.body;

  try {
    const verification = await client.verify
      .services(TWILIO_SERVICE_SID)
      .verifications
      .create({
        to: phone,
        channel: 'sms'
      });

    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully',
      payload: {
        status: verification.status
      }
    });
  } catch (error) {
    console.error('Twilio verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification code'
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const verificationCheck = await client.verify
      .services(TWILIO_SERVICE_SID)
      .verificationChecks
      .create({
        to: phone,
        code: otp
      });

    if (verificationCheck.status === 'approved') {
      res.status(200).json({
        success: true,
        message: 'Phone number verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
  } catch (error) {
    console.error('Twilio verification check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying code'
    });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // Update user's profile picture path
    const user = await User.findById(req.user.id);
    user.profilePicture = `uploads/profile-images/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: user,
        profilePicture: `uploads/profile-images/${req.file.filename}`
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message || 'Failed to update profile picture'
    });
  }
};
// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googleId, photo } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, update their googleId and photo if missing
      // We don't overwrite existing profile pictures unless they are default/empty
      if (!user.googleId) user.googleId = googleId;
      if (!user.profilePicture && photo) user.profilePicture = photo;

      // If user was unverified but logs in with Google (which verifies email), mark as verified
      if (!user.verified) {
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
      }

      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user
      // Generate a random password since they use Google
      const randomPassword = crypto.randomBytes(16).toString('hex');

      user = await User.create({
        name,
        email,
        password: randomPassword,
        googleId,
        profilePicture: photo,
        role: 'civilian', // Default role
        verified: true, // Google emails are verified
        phoneVerified: false
      });

      // Send welcome email (optional)
      try {
        await emailService.sendWelcomeEmail(user.email, user.name, user.role);
      } catch (err) {
        console.error("Welcome email failed", err);
      }
    }

    // Generate JWT and login
    createSendToken(user, 200, res);

  } catch (err) {
    console.error("Google Login Backend Error:", err);
    res.status(400).json({
      status: 'error',
      message: err.message || 'Google authentication failed'
    });
  }
};

// Google Login (Fixed: No Auto-Signup)
exports.googleLoginFixed = async (req, res) => {
  try {
    const { email, name, googleId, photo } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, update their googleId and photo if missing
      if (!user.googleId) user.googleId = googleId;
      if (!user.profilePicture && photo) user.profilePicture = photo;

      // If user was unverified but logs in with Google (which verifies email), mark as verified
      if (!user.verified) {
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
      }

      await user.save({ validateBeforeSave: false });
    } else {
      // Disable Auto-Signup: Return error if user does not exist
      return res.status(404).json({
        status: 'fail',
        message: 'User email not found. Please sign up first.'
      });
    }

    // Generate JWT and login
    createSendToken(user, 200, res);

  } catch (err) {
    console.error("Google Login Backend Error:", err);
    res.status(400).json({
      status: 'error',
      message: err.message || 'Google authentication failed'
    });
  }
};
