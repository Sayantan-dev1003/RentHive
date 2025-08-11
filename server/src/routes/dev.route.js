const express = require('express');
const {
  createProduct,
  updateProduct,
  hardDeleteProduct,
  getAllProductsIncludingInactive
} = require('../controllers/product.controller');
const {
  getOrders,
  getOrderById,
  createQuote,
  confirmOrder
} = require('../controllers/order.controller');

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

// Simple order operations (bypass auth for development)
router.get('/orders', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const orders = await Order.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .exec();
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Seed orders route
router.post('/seed-orders', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    
    // Get existing products to create realistic orders
    const products = await Product.find({}).limit(5);
    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products found. Please seed products first.'
      });
    }

    const sampleOrders = [
      {
        customerId: "64df7f3a4b9c4d8e5f9a1234",
        items: [
          {
            productId: products[0]._id,
            quantity: 1,
            rentalDuration: {
              startDate: new Date('2025-01-15'),
              endDate: new Date('2025-01-18')
            },
            priceApplied: {
              basePrice: 450,
              discountAmount: 0,
              totalPrice: 450
            }
          }
        ],
        status: 'reserved',
        paymentStatus: 'paid',
        totalAmount: 450,
        depositAmount: 200,
        lateFee: 0
      },
      {
        customerId: "64df7f3a4b9c4d8e5f9a1235",
        items: [
          {
            productId: products[1]._id,
            quantity: 2,
            rentalDuration: {
              startDate: new Date('2025-01-20'),
              endDate: new Date('2025-01-23')
            },
            priceApplied: {
              basePrice: 360,
              discountAmount: 0,
              totalPrice: 360
            }
          }
        ],
        status: 'quotation',
        paymentStatus: 'pending',
        totalAmount: 360,
        depositAmount: 100,
        lateFee: 0
      },
      {
        customerId: "64df7f3a4b9c4d8e5f9a1236",
        items: [
          {
            productId: products[2]._id,
            quantity: 1,
            rentalDuration: {
              startDate: new Date('2025-01-25'),
              endDate: new Date('2025-01-26')
            },
            priceApplied: {
              basePrice: 450,
              discountAmount: 0,
              totalPrice: 450
            }
          }
        ],
        status: 'picked_up',
        paymentStatus: 'paid',
        totalAmount: 450,
        depositAmount: 150,
        lateFee: 0
      }
    ];

    await Order.deleteMany({}); // Clear existing orders
    const orders = await Order.insertMany(sampleOrders);
    
    res.json({
      success: true,
      message: `${orders.length} sample orders added`,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error seeding orders',
      error: error.message
    });
  }
});

module.exports = router;