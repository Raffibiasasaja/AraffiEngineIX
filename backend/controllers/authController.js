const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    throw new AppError('Username already exists', 400);
  }

  // Create user
  const user = await User.create({
    username,
    password,
    role: role || 'customer'
  });

  // Generate token
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      token
    }
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = await User.findByUsername(username);
  if (!user) {
    throw new AppError('Invalid username or password', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid username or password', 401);
  }

  // Generate token
  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token
    }
  });
});

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toJSON()
    }
  });
});

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const updateData = {};

  if (username && username !== req.user.username) {
    // Check if new username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      throw new AppError('Username already exists', 400);
    }
    updateData.username = username;
  }

  if (password) {
    updateData.password = password;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No fields to update', 400);
  }

  const updatedUser = await req.user.update(updateData);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
});

/**
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

/**
 * Verify token
 * @route GET /api/auth/verify
 * @access Private
 */
const verifyToken = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user.toJSON()
    }
  });
});

/**
 * Get all users (admin/owner only)
 * @route GET /api/auth/users
 * @access Private (Admin/Owner)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll();

  res.json({
    success: true,
    data: {
      users,
      count: users.length
    }
  });
});

/**
 * Create user by admin
 * @route POST /api/auth/users
 * @access Private (Admin/Owner)
 */
const createUser = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    throw new AppError('Username already exists', 400);
  }

  // Create user
  const user = await User.create({
    username,
    password,
    role: role || 'customer'
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: user.toJSON()
    }
  });
});

/**
 * Update user by admin
 * @route PUT /api/auth/users/:id
 * @access Private (Admin/Owner)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const updateData = {};

  if (username && username !== user.username) {
    // Check if new username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      throw new AppError('Username already exists', 400);
    }
    updateData.username = username;
  }

  if (password) {
    updateData.password = password;
  }

  if (role) {
    updateData.role = role;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No fields to update', 400);
  }

  const updatedUser = await user.update(updateData);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
});

/**
 * Delete user by admin
 * @route DELETE /api/auth/users/:id
 * @access Private (Admin/Owner)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (id === req.user.id) {
    throw new AppError('Cannot delete your own account', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await user.delete();

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  verifyToken,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};