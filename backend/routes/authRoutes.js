const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');

// Middleware
const { authenticate, adminOrOwner } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateIdParam
} = require('../middleware/validation');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticate, apiLimiter, authController.updateProfile);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', authenticate, authController.verifyToken);

// Admin/Owner only routes
/**
 * @route   GET /api/auth/users
 * @desc    Get all users
 * @access  Private (Admin/Owner)
 */
router.get('/users', authenticate, adminOrOwner, authController.getAllUsers);

/**
 * @route   POST /api/auth/users
 * @desc    Create new user (by admin)
 * @access  Private (Admin/Owner)
 */
router.post('/users', authenticate, adminOrOwner, validateRegister, authController.createUser);

/**
 * @route   PUT /api/auth/users/:id
 * @desc    Update user by ID
 * @access  Private (Admin/Owner)
 */
router.put('/users/:id', authenticate, adminOrOwner, validateIdParam, authController.updateUser);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user by ID
 * @access  Private (Admin/Owner)
 */
router.delete('/users/:id', authenticate, adminOrOwner, validateIdParam, authController.deleteUser);

module.exports = router;