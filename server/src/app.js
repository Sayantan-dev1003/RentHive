const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.route');
const productRoutes = require('./routes/product.route');
const pricelistRoutes = require('./routes/pricelist.route');
const orderRoutes = require('./routes/order.route');
const paymentRoutes = require('./routes/payment.route');
const notificationRoutes = require('./routes/notification.route');
const reportRoutes = require('./routes/report.route');

// Import middleware
const { errorHandler } = require('./middlewares/errorHandler');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('combined'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RentHive API is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RentHive API Documentation'
}));

// API JSON endpoint for swagger specification
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Development routes (remove in production)
app.post('/api/dev/seed-products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    
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

// Development product management routes (bypass auth)
app.post('/api/dev/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

app.put('/api/dev/products/:id', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

app.delete('/api/dev/products/:id', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pricelists', pricelistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
