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

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Electronics, Furniture, Vehicles, Sports, Tools, Events, Other]
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum daily price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum daily price
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         products:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Product'
 *                         pagination:
 *                           type: object
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - pricing
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Professional Camera"
 *               category:
 *                 type: string
 *                 enum: [Electronics, Furniture, Vehicles, Sports, Tools, Events, Other]
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 example: "High-quality DSLR camera for professional photography"
 *               pricing:
 *                 type: object
 *                 required: [hour, day, week, month]
 *                 properties:
 *                   hour:
 *                     type: number
 *                     example: 50
 *                   day:
 *                     type: number
 *                     example: 300
 *                   week:
 *                     type: number
 *                     example: 1800
 *                   month:
 *                     type: number
 *                     example: 6000
 *               stock:
 *                 type: number
 *                 example: 5
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["image1.jpg", "image2.jpg"]
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         product:
 *                           $ref: '#/components/schemas/Product'

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         product:
 *                           $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               pricing:
 *                 type: object
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully

/**
 * @swagger
 * /api/products/{id}/availability:
 *   get:
 *     summary: Check product availability
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date
 *         example: "2024-01-15T09:00:00Z"
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date
 *         example: "2024-01-17T18:00:00Z"
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Required quantity
 *     responses:
 *       200:
 *         description: Availability check completed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                         availableQuantity:
 *                           type: integer
 *                         requestedQuantity:
 *                           type: integer
 *                         totalStock:
 *                           type: integer
 */

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
