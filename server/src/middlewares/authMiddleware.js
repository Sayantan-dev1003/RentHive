const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Authentication middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Role authorization middleware factory
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of these roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next();
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return errors, just continue
    next();
  }
};

// Middleware to check if user owns the resource or is admin
const ownerOrAdmin = (resourceUserIdField = 'customerId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // Admin users can access any resource
    if (req.user.role === 'end_user') {
      return next();
    }
    
    // For customers, check if they own the resource
    const resourceUserId = req.body[resourceUserIdField] || 
                          req.params[resourceUserIdField] || 
                          req.query[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource owner identification required.'
      });
    }
    
    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'renthive-api'
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  auth,
  authorizeRoles,
  optionalAuth,
  ownerOrAdmin,
  generateToken,
  verifyToken
};
