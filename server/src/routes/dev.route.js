const express = require('express');
const {
  createProduct,
  updateProduct,
  hardDeleteProduct,
  getAllProductsIncludingInactive
} = require('../controllers/product.controller');

const router = express.Router();

/**
 * Development routes - These bypass authentication
 * Remove these routes in production!
 */

// Seed products route
router.post('/seed-products', async (req, res) => {
  try {
    const Product = require('../models/Product');
    
    const sampleProducts = [
      {
        name: 'Professional DSLR Camera',
        category: 'Electronics',
        description: 'High-quality DSLR camera for professional photography and videography',
        pricing: { hour: 50, day: 300, week: 1800, month: 6000 },
        stock: 3
      },
      {
        name: 'Electric Drill Set',
        category: 'Tools',
        description: 'Complete electric drill set with various bits and accessories',
        pricing: { hour: 20, day: 120, week: 700, month: 2500 },
        stock: 5
      },
      {
        name: 'Portable Generator',
        category: 'Tools',
        description: 'Portable power generator for outdoor events and emergencies',
        pricing: { hour: 75, day: 450, week: 2700, month: 9000 },
        stock: 2
      },
      {
        name: 'Camping Tent (6-person)',
        category: 'Sports',
        description: 'Large family camping tent suitable for 6 people',
        pricing: { hour: 15, day: 80, week: 480, month: 1600 },
        stock: 4
      }
    ];

    await Product.deleteMany({}); // Clear existing products
    const products = await Product.insertMany(sampleProducts);
    
    res.json({
      success: true,
      message: `${products.length} sample products added`,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error seeding products',
      error: error.message
    });
  }
});

// Product CRUD operations (bypass auth for development)
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', hardDeleteProduct); // Hard delete for development
router.get('/products/all', getAllProductsIncludingInactive);

module.exports = router;