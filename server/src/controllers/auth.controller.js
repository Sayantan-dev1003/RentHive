const User = require('../models/User');
const { generateToken } = require('../middlewares/authMiddleware');
const { asyncHandler, createValidationError, createUnauthorizedError } = require('../middlewares/errorHandler');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Validate required fields
  if (!name || !email || !password || !phone) {
    throw createValidationError('All fields are required', {
      name: !name ? 'Name is required' : undefined,
      email: !email ? 'Email is required' : undefined,
      password: !password ? 'Password is required' : undefined,
      phone: !phone ? 'Phone is required' : undefined
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw createValidationError('User with this email already exists');
  }

  // Validate role
  const validRoles = ['customer', 'end_user'];
  if (role && !validRoles.includes(role)) {
    throw createValidationError('Invalid role specified');
  }

  // Create new user
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone.trim(),
    role: role || 'customer'
  });

  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  // Return user profile without password
  const userProfile = user.toJSON();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userProfile,
      token
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw createValidationError('Email and password are required');
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    throw createUnauthorizedError('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw createUnauthorizedError('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Return user profile without password
  const userProfile = user.toJSON();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userProfile,
      token
    }
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.toJSON()
    }
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const userId = req.user._id;

  // Build update object
  const updateData = {};
  if (name) updateData.name = name.trim();
  if (phone) updateData.phone = phone.trim();

  // Validate phone format if provided
  if (phone && !/^[0-9]{10}$/.test(phone.trim())) {
    throw createValidationError('Please enter a valid 10-digit phone number');
  }

  const user = await User.findByIdAndUpdate(
    userId, 
    updateData, 
    { new: true, runValidators: true }
  );

  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON()
    }
  });
});

/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!currentPassword || !newPassword) {
    throw createValidationError('Current password and new password are required');
  }

  // Validate new password length
  if (newPassword.length < 6) {
    throw createValidationError('New password must be at least 6 characters long');
  }

  // Find user with password
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    throw createUnauthorizedError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Refresh token
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token
    }
  });
});

/**
 * Get all users (admin only)
 * GET /api/auth/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  
  // Build query
  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * Delete user (admin only)
 * DELETE /api/auth/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user._id.toString()) {
    throw createValidationError('You cannot delete your own account');
  }

  const user = await User.findById(id);
  
  if (!user) {
    throw createValidationError('User not found');
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  getAllUsers,
  deleteUser
};
