const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  checkAvailability,
  getAvailabilityCalendar,
  getCategories,
  searchProducts,
  getFeaturedProducts
} = require('../controllers/product.controller');
const { auth, authorizeRoles, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.get('/:id/availability', checkAvailability);
router.get('/:id/calendar', getAvailabilityCalendar);

// Protected routes (admin only)
router.post('/', auth, authorizeRoles('end_user'), createProduct);
router.put('/:id', auth, authorizeRoles('end_user'), updateProduct);
router.delete('/:id', auth, authorizeRoles('end_user'), deleteProduct);

module.exports = router;
