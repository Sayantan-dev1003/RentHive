const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus
} = require('../controllers/user.controller');

// @route   GET /api/users/:userId/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/:userId/wishlist', getWishlist);

// @route   POST /api/users/:userId/wishlist
// @desc    Add product to wishlist
// @access  Private
router.post('/:userId/wishlist', addToWishlist);

// @route   DELETE /api/users/:userId/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:userId/wishlist/:productId', removeFromWishlist);

// @route   DELETE /api/users/:userId/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/:userId/wishlist', clearWishlist);

// @route   GET /api/users/:userId/wishlist/check/:productId
// @desc    Check if product is in wishlist
// @access  Private
router.get('/:userId/wishlist/check/:productId', checkWishlistStatus);

module.exports = router;
