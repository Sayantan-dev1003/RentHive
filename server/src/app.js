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
const errorHandler = require('./middlewares/errorHandler');

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
