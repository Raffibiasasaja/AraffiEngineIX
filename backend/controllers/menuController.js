const MenuItem = require('../models/MenuItem');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * Menu Controller
 * Handles menu item operations
 */

/**
 * Get all menu items
 * @route GET /api/menu
 * @access Public
 */
const getAllMenuItems = asyncHandler(async (req, res) => {
  const { available } = req.query;
  
  const filters = {};
  if (available !== undefined) {
    filters.available = available === 'true';
  }

  const menuItems = await MenuItem.findAll(filters);

  res.json({
    success: true,
    data: {
      menuItems,
      count: menuItems.length
    }
  });
});

/**
 * Get available menu items only
 * @route GET /api/menu/available
 * @access Public
 */
const getAvailableMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.getAvailable();

  res.json({
    success: true,
    data: {
      menuItems,
      count: menuItems.length
    }
  });
});

/**
 * Get single menu item by ID
 * @route GET /api/menu/:id
 * @access Public
 */
const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  res.json({
    success: true,
    data: {
      menuItem
    }
  });
});

/**
 * Search menu items by name
 * @route GET /api/menu/search
 * @access Public
 */
const searchMenuItems = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    throw new AppError('Search query is required', 400);
  }

  const menuItems = await MenuItem.search(q.trim());

  res.json({
    success: true,
    data: {
      menuItems,
      count: menuItems.length,
      searchQuery: q.trim()
    }
  });
});

/**
 * Create new menu item
 * @route POST /api/menu
 * @access Private (Admin/Owner)
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, available } = req.body;

  const menuItem = await MenuItem.create({
    name,
    description,
    price,
    available
  });

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: {
      menuItem
    }
  });
});

/**
 * Update menu item
 * @route PUT /api/menu/:id
 * @access Private (Admin/Owner)
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, available } = req.body;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (available !== undefined) updateData.available = available;

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No fields to update', 400);
  }

  const updatedMenuItem = await menuItem.update(updateData);

  res.json({
    success: true,
    message: 'Menu item updated successfully',
    data: {
      menuItem: updatedMenuItem
    }
  });
});

/**
 * Toggle menu item availability
 * @route PATCH /api/menu/:id/toggle
 * @access Private (Admin/Owner)
 */
const toggleMenuItemAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  const updatedMenuItem = await menuItem.toggleAvailability();

  res.json({
    success: true,
    message: `Menu item ${updatedMenuItem.available ? 'enabled' : 'disabled'} successfully`,
    data: {
      menuItem: updatedMenuItem
    }
  });
});

/**
 * Delete menu item
 * @route DELETE /api/menu/:id
 * @access Private (Admin/Owner)
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  await menuItem.delete();

  res.json({
    success: true,
    message: 'Menu item deleted successfully'
  });
});

/**
 * Bulk create menu items
 * @route POST /api/menu/bulk
 * @access Private (Admin/Owner)
 */
const bulkCreateMenuItems = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Items array is required and must not be empty', 400);
  }

  const createdItems = [];
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const item = items[i];
      const menuItem = await MenuItem.create(item);
      createdItems.push(menuItem);
    } catch (error) {
      errors.push({
        index: i,
        item: items[i],
        error: error.message
      });
    }
  }

  res.status(201).json({
    success: true,
    message: 'Bulk menu item creation completed',
    data: {
      created: createdItems,
      createdCount: createdItems.length,
      errors,
      errorCount: errors.length
    }
  });
});

/**
 * Bulk update menu items availability
 * @route PATCH /api/menu/bulk/availability
 * @access Private (Admin/Owner)
 */
const bulkUpdateAvailability = asyncHandler(async (req, res) => {
  const { ids, available } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('IDs array is required and must not be empty', 400);
  }

  if (typeof available !== 'boolean') {
    throw new AppError('Available field must be a boolean', 400);
  }

  const updatedItems = [];
  const notFoundIds = [];

  for (const id of ids) {
    try {
      const menuItem = await MenuItem.findById(id);
      if (!menuItem) {
        notFoundIds.push(id);
        continue;
      }

      const updatedMenuItem = await menuItem.update({ available });
      updatedItems.push(updatedMenuItem);
    } catch (error) {
      notFoundIds.push(id);
    }
  }

  res.json({
    success: true,
    message: 'Bulk availability update completed',
    data: {
      updated: updatedItems,
      updatedCount: updatedItems.length,
      notFound: notFoundIds,
      notFoundCount: notFoundIds.length
    }
  });
});

/**
 * Get menu statistics
 * @route GET /api/menu/stats
 * @access Private (Admin/Owner)
 */
const getMenuStats = asyncHandler(async (req, res) => {
  const allItems = await MenuItem.findAll();
  const availableItems = await MenuItem.getAvailable();

  const stats = {
    totalItems: allItems.length,
    availableItems: availableItems.length,
    unavailableItems: allItems.length - availableItems.length,
    averagePrice: allItems.length > 0 
      ? Math.round(allItems.reduce((sum, item) => sum + item.price, 0) / allItems.length)
      : 0,
    priceRange: allItems.length > 0 
      ? {
          min: Math.min(...allItems.map(item => item.price)),
          max: Math.max(...allItems.map(item => item.price))
        }
      : { min: 0, max: 0 }
  };

  res.json({
    success: true,
    data: {
      stats
    }
  });
});

module.exports = {
  getAllMenuItems,
  getAvailableMenuItems,
  getMenuItemById,
  searchMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
  bulkCreateMenuItems,
  bulkUpdateAvailability,
  getMenuStats
};