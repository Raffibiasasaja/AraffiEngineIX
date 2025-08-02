const express = require('express');
const router = express.Router();

// Controllers
const menuController = require('../controllers/menuController');

// Middleware
const { authenticate, adminOrOwner } = require('../middleware/auth');
const { publicLimiter, apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const {
  validateMenuItem,
  validateMenuItemUpdate,
  validateIdParam
} = require('../middleware/validation');

/**
 * Menu Routes
 * Base path: /api/menu
 */

// Public routes
/**
 * @route   GET /api/menu
 * @desc    Get all menu items (with optional filtering)
 * @access  Public
 */
router.get('/', publicLimiter, menuController.getAllMenuItems);

/**
 * @route   GET /api/menu/available
 * @desc    Get only available menu items
 * @access  Public
 */
router.get('/available', publicLimiter, menuController.getAvailableMenuItems);

/**
 * @route   GET /api/menu/search
 * @desc    Search menu items by name
 * @access  Public
 */
router.get('/search', publicLimiter, menuController.searchMenuItems);

/**
 * @route   GET /api/menu/:id
 * @desc    Get single menu item by ID
 * @access  Public
 */
router.get('/:id', publicLimiter, validateIdParam, menuController.getMenuItemById);

// Admin/Owner only routes
/**
 * @route   POST /api/menu
 * @desc    Create new menu item
 * @access  Private (Admin/Owner)
 */
router.post('/', authenticate, adminOrOwner, adminLimiter, validateMenuItem, menuController.createMenuItem);

/**
 * @route   PUT /api/menu/:id
 * @desc    Update menu item
 * @access  Private (Admin/Owner)
 */
router.put('/:id', authenticate, adminOrOwner, adminLimiter, validateIdParam, validateMenuItemUpdate, menuController.updateMenuItem);

/**
 * @route   PATCH /api/menu/:id/toggle
 * @desc    Toggle menu item availability
 * @access  Private (Admin/Owner)
 */
router.patch('/:id/toggle', authenticate, adminOrOwner, adminLimiter, validateIdParam, menuController.toggleMenuItemAvailability);

/**
 * @route   DELETE /api/menu/:id
 * @desc    Delete menu item
 * @access  Private (Admin/Owner)
 */
router.delete('/:id', authenticate, adminOrOwner, adminLimiter, validateIdParam, menuController.deleteMenuItem);

/**
 * @route   POST /api/menu/bulk
 * @desc    Bulk create menu items
 * @access  Private (Admin/Owner)
 */
router.post('/bulk', authenticate, adminOrOwner, adminLimiter, menuController.bulkCreateMenuItems);

/**
 * @route   PATCH /api/menu/bulk/availability
 * @desc    Bulk update menu items availability
 * @access  Private (Admin/Owner)
 */
router.patch('/bulk/availability', authenticate, adminOrOwner, adminLimiter, menuController.bulkUpdateAvailability);

/**
 * @route   GET /api/menu/stats
 * @desc    Get menu statistics
 * @access  Private (Admin/Owner)
 */
router.get('/stats', authenticate, adminOrOwner, apiLimiter, menuController.getMenuStats);

module.exports = router;