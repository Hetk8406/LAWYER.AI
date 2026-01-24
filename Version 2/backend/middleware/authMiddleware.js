const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in Authorization header or SSO cookie
    const authHeader = req.headers.authorization;
    const ssoToken = req.cookies?.ssoToken;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (ssoToken) {
      // Verify SSO token
      const user = await User.findOne({ ssoToken: await User.hashToken(ssoToken) });
      if (user && await user.verifySSOToken(ssoToken)) {
        req.user = user;
        return next();
      }
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Please log in to access this resource'
      });
    }

    try {
      // 2. Verify JWT token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // 3. Check if user exists
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token no longer exists'
        });
      }

      // 4. Check if user is verified (exempt admins)
      if (!user.verified && user.role !== 'admin') {
        return res.status(403).json({
          status: 'fail',
          message: 'Please verify your email to access this resource'
        });
      }

      // 5. Update activity tracking
      await user.updateLastActive();

      // 6. Attach user to request
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid token. Please log in again'
        });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Your token has expired. Please log in again'
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Middleware to verify SSO token
const verifySSOToken = async (req, res, next) => {
  try {
    const ssoToken = req.cookies?.ssoToken;

    if (!ssoToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'No SSO token found'
      });
    }

    const user = await User.findOne({ ssoToken: await User.hashToken(ssoToken) });
    if (!user || !(await user.verifySSOToken(ssoToken))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired SSO token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in SSO middleware:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user is verified
const requireVerified = async (req, res, next) => {
  try {
    if (!req.user.verified && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Please verify your email to access this resource'
      });
    }
    next();
  } catch (error) {
    console.error('Error in verification middleware:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Middleware to check user role
const checkRole = (role) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Please log in to access this resource'
        });
      }

      if (req.user.role !== role) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to perform this action'
        });
      }

      next();
    } catch (error) {
      console.error('Error in role check middleware:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };
};

// Middleware to restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  requireVerified,
  checkRole,
  restrictTo,
  verifySSOToken
};
