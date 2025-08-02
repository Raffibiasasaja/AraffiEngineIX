const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { Parser } = require('json2csv');

/**
 * Order Controller
 * Handles order operations
 */

/**
 * Get all orders with filtering and pagination
 * @route GET /api/orders
 * @access Private (Admin/Owner)
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const result = await Order.findAll(req.query);

  res.json({
    success: true,
    data: result
  });
});

/**
 * Get pending orders
 * @route GET /api/orders/pending
 * @access Private (Admin)
 */
const getPendingOrders = asyncHandler(async (req, res) => {
  const orders = await Order.getPending();

  res.json({
    success: true,
    data: {
      orders,
      count: orders.length
    }
  });
});

/**
 * Get in progress orders
 * @route GET /api/orders/in-progress
 * @access Private (Admin)
 */
const getInProgressOrders = asyncHandler(async (req, res) => {
  const orders = await Order.getInProgress();

  res.json({
    success: true,
    data: {
      orders,
      count: orders.length
    }
  });
});

/**
 * Get completed orders
 * @route GET /api/orders/completed
 * @access Private (Admin/Owner)
 */
const getCompletedOrders = asyncHandler(async (req, res) => {
  const orders = await Order.getCompleted();

  res.json({
    success: true,
    data: {
      orders,
      count: orders.length
    }
  });
});

/**
 * Get single order by ID
 * @route GET /api/orders/:id
 * @access Private (Admin/Owner)
 */
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.json({
    success: true,
    data: {
      order
    }
  });
});

/**
 * Create new order
 * @route POST /api/orders
 * @access Public
 */
const createOrder = asyncHandler(async (req, res) => {
  const { tableNumber, menu, note } = req.body;

  // Verify menu item exists and is available
  const menuItems = await MenuItem.getAvailable();
  const menuItem = menuItems.find(item => item.name === menu);
  
  if (!menuItem) {
    throw new AppError('Menu item not found or not available', 400);
  }

  const order = await Order.create({
    tableNumber,
    menu,
    note: note || ''
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: {
      order
    }
  });
});

/**
 * Update order status and note
 * @route PUT /api/orders/:id
 * @access Private (Admin)
 */
const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (note !== undefined) updateData.note = note;

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No fields to update', 400);
  }

  const updatedOrder = await order.update(updateData);

  res.json({
    success: true,
    message: 'Order updated successfully',
    data: {
      order: updatedOrder
    }
  });
});

/**
 * Accept order (change status to In Progress)
 * @route PATCH /api/orders/:id/accept
 * @access Private (Admin)
 */
const acceptOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status !== 'Pending') {
    throw new AppError('Only pending orders can be accepted', 400);
  }

  const updatedOrder = await order.update({ status: 'In Progress' });

  res.json({
    success: true,
    message: 'Order accepted and set to In Progress',
    data: {
      order: updatedOrder
    }
  });
});

/**
 * Complete order (change status to Completed)
 * @route PATCH /api/orders/:id/complete
 * @access Private (Admin)
 */
const completeOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status === 'Completed') {
    throw new AppError('Order is already completed', 400);
  }

  const updatedOrder = await order.update({ status: 'Completed' });

  res.json({
    success: true,
    message: 'Order marked as completed',
    data: {
      order: updatedOrder
    }
  });
});

/**
 * Delete order
 * @route DELETE /api/orders/:id
 * @access Private (Admin/Owner)
 */
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await order.delete();

  res.json({
    success: true,
    message: 'Order deleted successfully'
  });
});

/**
 * Get orders by table number
 * @route GET /api/orders/table/:tableNumber
 * @access Private (Admin)
 */
const getOrdersByTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;

  const result = await Order.findAll({ 
    tableNumber,
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder
  });

  res.json({
    success: true,
    data: result
  });
});

/**
 * Get daily statistics
 * @route GET /api/orders/stats/daily
 * @access Private (Owner)
 */
const getDailyStats = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const stats = await Order.getDailyStats(targetDate);

  res.json({
    success: true,
    data: {
      date: targetDate,
      stats
    }
  });
});

/**
 * Get popular menu items
 * @route GET /api/orders/stats/popular
 * @access Private (Owner)
 */
const getPopularItems = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  const popularItems = await Order.getPopularItems(start, end);

  res.json({
    success: true,
    data: {
      popularItems,
      dateRange: {
        startDate: start,
        endDate: end
      }
    }
  });
});

/**
 * Export orders to CSV
 * @route GET /api/orders/export/csv
 * @access Private (Admin/Owner)
 */
const exportOrdersCSV = asyncHandler(async (req, res) => {
  const result = await Order.findAll({
    ...req.query,
    limit: 10000 // Large limit for export
  });

  const orders = result.orders.map(order => ({
    ID: order.id,
    'Table Number': order.tableNumber,
    'Menu Item': order.menu,
    Note: order.note || '',
    Status: order.status,
    'Order Time': new Date(order.timestamp).toLocaleString(),
    'Created At': new Date(order.createdAt).toLocaleString(),
    'Updated At': new Date(order.updatedAt).toLocaleString()
  }));

  const fields = ['ID', 'Table Number', 'Menu Item', 'Note', 'Status', 'Order Time', 'Created At', 'Updated At'];
  const parser = new Parser({ fields });
  const csv = parser.parse(orders);

  const filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

/**
 * Bulk update order status
 * @route PATCH /api/orders/bulk/status
 * @access Private (Admin)
 */
const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('IDs array is required and must not be empty', 400);
  }

  if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const updatedOrders = [];
  const notFoundIds = [];

  for (const id of ids) {
    try {
      const order = await Order.findById(id);
      if (!order) {
        notFoundIds.push(id);
        continue;
      }

      const updatedOrder = await order.update({ status });
      updatedOrders.push(updatedOrder);
    } catch (error) {
      notFoundIds.push(id);
    }
  }

  res.json({
    success: true,
    message: 'Bulk status update completed',
    data: {
      updated: updatedOrders,
      updatedCount: updatedOrders.length,
      notFound: notFoundIds,
      notFoundCount: notFoundIds.length
    }
  });
});

/**
 * Bulk delete orders
 * @route DELETE /api/orders/bulk
 * @access Private (Admin/Owner)
 */
const bulkDeleteOrders = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('IDs array is required and must not be empty', 400);
  }

  const deletedIds = [];
  const notFoundIds = [];

  for (const id of ids) {
    try {
      const order = await Order.findById(id);
      if (!order) {
        notFoundIds.push(id);
        continue;
      }

      await order.delete();
      deletedIds.push(id);
    } catch (error) {
      notFoundIds.push(id);
    }
  }

  res.json({
    success: true,
    message: 'Bulk delete completed',
    data: {
      deleted: deletedIds,
      deletedCount: deletedIds.length,
      notFound: notFoundIds,
      notFoundCount: notFoundIds.length
    }
  });
});

/**
 * Get order analytics for owner dashboard
 * @route GET /api/orders/analytics
 * @access Private (Owner)
 */
const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  // Get orders for the date range
  const result = await Order.findAll({
    startDate: start,
    endDate: end,
    limit: 10000
  });

  const orders = result.orders;

  // Calculate analytics
  const analytics = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'Completed').length,
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
    inProgressOrders: orders.filter(o => o.status === 'In Progress').length,
    uniqueTables: new Set(orders.map(o => o.tableNumber)).size,
    
    // Daily breakdown
    dailyBreakdown: {},
    
    // Menu popularity
    menuStats: {},
    
    // Hourly distribution
    hourlyDistribution: Array(24).fill(0)
  };

  // Calculate daily breakdown
  orders.forEach(order => {
    const date = new Date(order.timestamp).toISOString().split('T')[0];
    if (!analytics.dailyBreakdown[date]) {
      analytics.dailyBreakdown[date] = {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0
      };
    }
    
    analytics.dailyBreakdown[date].total++;
    analytics.dailyBreakdown[date][order.status.toLowerCase().replace(' ', '')] = 
      (analytics.dailyBreakdown[date][order.status.toLowerCase().replace(' ', '')] || 0) + 1;
  });

  // Calculate menu statistics
  orders.forEach(order => {
    if (!analytics.menuStats[order.menu]) {
      analytics.menuStats[order.menu] = {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0
      };
    }
    
    analytics.menuStats[order.menu].total++;
    analytics.menuStats[order.menu][order.status.toLowerCase().replace(' ', '')] = 
      (analytics.menuStats[order.menu][order.status.toLowerCase().replace(' ', '')] || 0) + 1;
  });

  // Calculate hourly distribution
  orders.forEach(order => {
    const hour = new Date(order.timestamp).getHours();
    analytics.hourlyDistribution[hour]++;
  });

  res.json({
    success: true,
    data: {
      analytics,
      dateRange: {
        startDate: start,
        endDate: end
      }
    }
  });
});

module.exports = {
  getAllOrders,
  getPendingOrders,
  getInProgressOrders,
  getCompletedOrders,
  getOrderById,
  createOrder,
  updateOrder,
  acceptOrder,
  completeOrder,
  deleteOrder,
  getOrdersByTable,
  getDailyStats,
  getPopularItems,
  exportOrdersCSV,
  bulkUpdateStatus,
  bulkDeleteOrders,
  getOrderAnalytics
};