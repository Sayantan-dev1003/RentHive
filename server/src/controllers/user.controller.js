const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/users/:userId/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate({
        path: 'wishlist.productId',
        select: 'name category description pricing stock currentAvailableStock images isActive'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out inactive products and add transformed data
    const wishlistItems = user.wishlist
      .filter(item => item.productId && item.productId.isActive)
      .map(item => ({
        id: item.productId._id,
        name: item.productId.name,
        category: item.productId.category,
        description: item.productId.description,
        price: `₹${item.productId.pricing.day}`,
        originalPrice: `₹${Math.round(item.productId.pricing.day * 1.2)}`,
        period: '/day',
        status: item.productId.currentAvailableStock > 0 ? 'Available' : 'Rented',
        rating: (4.0 + Math.random() * 1).toFixed(1),
        location: ['Mumbai, Maharashtra', 'Delhi, NCR', 'Pune, Maharashtra', 'Bangalore, Karnataka'][Math.floor(Math.random() * 4)],
        image: item.productId.images?.[0] || `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center`,
        brand: item.productId.name.split(' ')[0] || 'Generic',
        isNew: (Date.now() - new Date(item.addedAt).getTime()) < 7 * 24 * 60 * 60 * 1000, // Added within last 7 days
        dateAdded: item.addedAt,
        stock: item.productId.stock,
        currentAvailableStock: item.productId.currentAvailableStock,
        originalData: item.productId
      }));

    res.status(200).json({
      success: true,
      data: { 
        items: wishlistItems,
        count: wishlistItems.length
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist',
      error: error.message
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/users/:userId/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Find user and check if product is already in wishlist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingItem = user.wishlist.find(item => 
      item.productId.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    user.wishlist.push({
      productId: productId,
      addedAt: new Date()
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: { productId, addedAt: new Date() }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/:userId/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemIndex = user.wishlist.findIndex(item => 
      item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    user.wishlist.splice(itemIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/users/:userId/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.wishlist = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/users/:userId/wishlist/check/:productId
// @access  Private
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isInWishlist = user.wishlist.some(item => 
      item.productId.toString() === productId
    );

    res.status(200).json({
      success: true,
      data: { isInWishlist }
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status',
      error: error.message
    });
  }
};
