const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and populates req.user with authenticated user data
 */

/**
 * Verify JWT token and authenticate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Add user to request object
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
        message: 'Token expired.'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Admin-only access middleware
 * Shorthand for authorize(['admin'])
 */
const adminOnly = authorize(['admin']);

/**
 * Owner-only access middleware
 * Shorthand for authorize(['owner'])
 */
const ownerOnly = authorize(['owner']);

/**
 * Admin or Owner access middleware
 * Shorthand for authorize(['admin', 'owner'])
 */
const adminOrOwner = authorize(['admin', 'owner']);

/**
 * Optional authentication middleware
 * Authenticates user if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

/**
 * Refresh token middleware
 * Generates a new token if the current one is close to expiring
 */
const refreshToken = (req, res, next) => {
  if (req.user) {
    const authHeader = req.header('Authorization');
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.decode(token);
      const now = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - now;
      
      // If token expires in less than 1 day, generate a new one
      if (timeUntilExpiry < 86400) { // 24 hours in seconds
        const newToken = generateToken(req.user);
        res.setHeader('X-New-Token', newToken);
      }
    } catch (error) {
      // Ignore token refresh errors
    }
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  adminOnly,
  ownerOnly,
  adminOrOwner,
  optionalAuth,
  generateToken,
  refreshToken
};