const express = require('express');
const {
  createPricelist,
  getPricelists,
  getPricelistById,
  updatePricelist,
  deletePricelist,
  getActivePricelists,
  getCustomerPricelists,
  previewPricelistDiscount,
  togglePricelistStatus
} = require('../controllers/pricelist.controller');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/active', getActivePricelists);

// Protected routes
router.use(auth); // Apply auth middleware to all routes below

// Customer and admin routes
router.get('/customer/:customerId', getCustomerPricelists);
router.post('/:id/preview', previewPricelistDiscount);

// Admin only routes
router.post('/', authorizeRoles('end_user'), createPricelist);
router.get('/', authorizeRoles('end_user'), getPricelists);
router.get('/:id', authorizeRoles('end_user'), getPricelistById);
router.put('/:id', authorizeRoles('end_user'), updatePricelist);
router.delete('/:id', authorizeRoles('end_user'), deletePricelist);
router.patch('/:id/toggle', authorizeRoles('end_user'), togglePricelistStatus);

module.exports = router;
