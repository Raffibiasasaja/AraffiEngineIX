const express = require('express');
const router = express.Router();

// Controllers
const orderController = require('../controllers/orderController');

// Middleware
const { authenticate, adminOnly, adminOrOwner, ownerOnly } = require('../middleware/auth');
const { orderLimiter, apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const {
  validateOrder,
  validateOrderUpdate,
  validateOrderQuery,
  validateIdParam,
  validateTableParam,
  validateDateRange
} = require('../middleware/validation');

/**
 * Order Routes
 * Base path: /api/orders
 */

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Public
 */
router.post('/', orderLimiter, validateOrder, orderController.createOrder);

// Admin routes
/**
 * @route   GET /api/orders
 * @desc    Get all orders with filtering and pagination
 * @access  Private (Admin/Owner)
 */
router.get('/', authenticate, adminOrOwner, validateOrderQuery, orderController.getAllOrders);

/**
 * @route   GET /api/orders/pending
 * @desc    Get pending orders
 * @access  Private (Admin)
 */
router.get('/pending', authenticate, adminOnly, orderController.getPendingOrders);

/**
 * @route   GET /api/orders/in-progress
 * @desc    Get in progress orders
 * @access  Private (Admin)
 */
router.get('/in-progress', authenticate, adminOnly, orderController.getInProgressOrders);

/**
 * @route   GET /api/orders/completed
 * @desc    Get completed orders
 * @access  Private (Admin/Owner)
 */
router.get('/completed', authenticate, adminOrOwner, orderController.getCompletedOrders);

/**
 * @route   GET /api/orders/export/csv
 * @desc    Export orders to CSV
 * @access  Private (Admin/Owner)
 */
router.get('/export/csv', authenticate, adminOrOwner, validateOrderQuery, orderController.exportOrdersCSV);

/**
 * @route   GET /api/orders/table/:tableNumber
 * @desc    Get orders by table number
 * @access  Private (Admin)
 */
router.get('/table/:tableNumber', authenticate, adminOnly, validateTableParam, validateOrderQuery, orderController.getOrdersByTable);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private (Admin/Owner)
 */
router.get('/:id', authenticate, adminOrOwner, validateIdParam, orderController.getOrderById);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order status and note
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, adminOnly, adminLimiter, validateIdParam, validateOrderUpdate, orderController.updateOrder);

/**
 * @route   PATCH /api/orders/:id/accept
 * @desc    Accept order (change status to In Progress)
 * @access  Private (Admin)
 */
router.patch('/:id/accept', authenticate, adminOnly, adminLimiter, validateIdParam, orderController.acceptOrder);

/**
 * @route   PATCH /api/orders/:id/complete
 * @desc    Complete order (change status to Completed)
 * @access  Private (Admin)
 */
router.patch('/:id/complete', authenticate, adminOnly, adminLimiter, validateIdParam, orderController.completeOrder);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order
 * @access  Private (Admin/Owner)
 */
router.delete('/:id', authenticate, adminOrOwner, adminLimiter, validateIdParam, orderController.deleteOrder);

/**
 * @route   PATCH /api/orders/bulk/status
 * @desc    Bulk update order status
 * @access  Private (Admin)
 */
router.patch('/bulk/status', authenticate, adminOnly, adminLimiter, orderController.bulkUpdateStatus);

/**
 * @route   DELETE /api/orders/bulk
 * @desc    Bulk delete orders
 * @access  Private (Admin/Owner)
 */
router.delete('/bulk', authenticate, adminOrOwner, adminLimiter, orderController.bulkDeleteOrders);

// Owner/Analytics routes
/**
 * @route   GET /api/orders/stats/daily
 * @desc    Get daily statistics
 * @access  Private (Owner)
 */
router.get('/stats/daily', authenticate, ownerOnly, apiLimiter, orderController.getDailyStats);

/**
 * @route   GET /api/orders/stats/popular
 * @desc    Get popular menu items
 * @access  Private (Owner)
 */
router.get('/stats/popular', authenticate, ownerOnly, apiLimiter, validateDateRange, orderController.getPopularItems);

/**
 * @route   GET /api/orders/analytics
 * @desc    Get comprehensive order analytics
 * @access  Private (Owner)
 */
router.get('/analytics', authenticate, ownerOnly, apiLimiter, validateDateRange, orderController.getOrderAnalytics);

module.exports = router;