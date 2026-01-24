const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const SPECIALIZATIONS = [
  'Criminal Law',
  'Civil Law',
  'Family Law',
  'Corporate Law',
  'Property Law',
  'Immigration Law',
  'General Practice'
];

const PERMISSIONS = {
  PROMPT_BAR: 'prompt_bar',
  POST_BLOG: 'post_blog',
  REPLY_COURTROOM: 'reply_courtroom',
  VIEW_BLOG: 'view_blog',
  MANAGE_CASES: 'manage_cases',
  PROVIDE_LEGAL_ADVICE: 'provide_legal_advice',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_ANALYTICS: 'view_analytics'
};

const ROLE_PERMISSIONS = {
  civilian: [
    PERMISSIONS.PROMPT_BAR,
    PERMISSIONS.VIEW_BLOG
  ],
  lawyer: [
    PERMISSIONS.PROMPT_BAR,
    PERMISSIONS.POST_BLOG,
    PERMISSIONS.REPLY_COURTROOM,
    PERMISSIONS.VIEW_BLOG,
    PERMISSIONS.MANAGE_CASES,
    PERMISSIONS.PROVIDE_LEGAL_ADVICE
  ],
  law_student: [
    PERMISSIONS.PROMPT_BAR,
    PERMISSIONS.REPLY_COURTROOM,
    PERMISSIONS.VIEW_BLOG
  ],
  admin: [
    ...Object.values(PERMISSIONS)
  ]
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [function () { return !this.ssoUser; }, 'Password required for non-SSO users'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['civilian', 'lawyer', 'law_student', 'admin'],
    required: [true, 'Please specify your role'],
    default: 'civilian'
  },
  experience: {
    type: Number,
    min: 0,
    validate: {
      validator: function (value) {
        return this.role !== 'lawyer' || (typeof value === 'number' && value >= 0);
      },
      message: 'Lawyers must provide valid years of experience'
    }
  },
  specialization: {
    type: String,
    enum: {
      values: SPECIALIZATIONS,
      message: '{VALUE} is not a valid specialization'
    },
    validate: {
      validator: function (value) {
        return this.role !== 'lawyer' || SPECIALIZATIONS.includes(value);
      },
      message: props => `${props.value} is not a valid specialization!`
    }
  },
  barCouncilId: {
    type: String,
    required: [function () { return this.role === 'lawyer'; }, 'Lawyers must provide their Bar Council ID'],
    unique: true,
    sparse: true
  },
  universityName: {
    type: String,
    validate: {
      validator: function (value) {
        return this.role !== 'law_student' || (value && value.length > 0);
      },
      message: 'Law students must provide their university name'
    }
  },
  studentId: {
    type: String,
    validate: {
      validator: function (value) {
        return this.role !== 'law_student' || (value && value.length > 0);
      },
      message: 'Law students must provide their student ID'
    },
    unique: true,
    sparse: true
  },
  yearOfStudy: {
    type: Number,
    required: [function () { return this.role === 'law_student'; }, 'Law students must provide their year of study'],
    validate: {
      validator: function (value) {
        return value >= 1 && value <= 5;
      },
      message: 'Law students must provide a valid year of study (1-5)'
    }
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  nation: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  profilePicture: {
    type: String,
    default: 'default.jpg'
  },
  language: {
    type: String,
    enum: ['english', 'hindi', 'gujarati'],
    default: 'english'
  },
  dob: {
    day: String,
    month: String,
    year: String
  },
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  chatType: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving (skip for SSO users)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.ssoUser) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method (not applicable for SSO users)
userSchema.methods.correctPassword = async function (candidatePassword) {
  if (this.ssoUser) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Activity tracking methods
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.isInactive = function () {
  const inactiveThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
  return this.lastActive < inactiveThreshold;
};

// Permission methods
userSchema.methods.hasPermission = function (permission) {
  if (!this.verified || !this.isActive) return false;
  return ROLE_PERMISSIONS[this.role]?.includes(permission) || false;
};

userSchema.methods.getPermissions = function () {
  if (!this.verified || !this.isActive) return [];
  return ROLE_PERMISSIONS[this.role] || [];
};

// Legacy permission methods mapped to new system
userSchema.methods.canAccessPromptBar = function () {
  return this.hasPermission(PERMISSIONS.PROMPT_BAR);
};

userSchema.methods.canPostBlog = function () {
  return this.hasPermission(PERMISSIONS.POST_BLOG);
};

userSchema.methods.canReplyInCourtroom = function () {
  return this.hasPermission(PERMISSIONS.REPLY_COURTROOM);
};

userSchema.methods.canViewBlog = function () {
  return this.hasPermission(PERMISSIONS.VIEW_BLOG);
};

userSchema.methods.canManageCases = function () {
  return this.hasPermission(PERMISSIONS.MANAGE_CASES);
};

userSchema.methods.canProvideLegalAdvice = function () {
  return this.hasPermission(PERMISSIONS.PROVIDE_LEGAL_ADVICE);
};

// Check if model exists before defining
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
