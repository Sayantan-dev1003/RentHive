const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Pricelist = require('../models/Pricelist');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Check database contents
const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database contents...\n');
    
    await connectDB();
    
    // Get counts for each collection
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const pricelistCount = await Pricelist.countDocuments();
    const orderCount = await Order.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const notificationCount = await Notification.countDocuments();
    const invoiceCount = await Invoice.countDocuments();
    
    console.log('📊 Database Summary:');
    console.log('====================');
    console.log(`👥 Users: ${userCount}`);
    console.log(`📦 Products: ${productCount}`);
    console.log(`💰 Pricelists: ${pricelistCount}`);
    console.log(`📋 Orders: ${orderCount}`);
    console.log(`💳 Payments: ${paymentCount}`);
    console.log(`🔔 Notifications: ${notificationCount}`);
    console.log(`📄 Invoices: ${invoiceCount}`);
    
    // Show sample data if exists
    if (userCount > 0) {
      console.log('\n👤 Sample Users:');
      const sampleUsers = await User.find().limit(3).select('name email role');
      sampleUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    if (productCount > 0) {
      console.log('\n📦 Sample Products:');
      const sampleProducts = await Product.find().limit(3).select('name category pricing.day stock');
      sampleProducts.forEach(product => {
        console.log(`  - ${product.name} (${product.category}) - ₹${product.pricing.day}/day - Stock: ${product.stock}`);
      });
    }
    
    if (orderCount > 0) {
      console.log('\n📋 Sample Orders:');
      const sampleOrders = await Order.find().limit(3).select('_id status paymentStatus totalAmount');
      sampleOrders.forEach(order => {
        console.log(`  - Order ${order._id.toString().slice(-6)} - ${order.status} - ₹${order.totalAmount || 'N/A'}`);
      });
    }
    
    // Database health check
    console.log('\n🏥 Database Health:');
    console.log('===================');
    
    if (userCount === 0) {
      console.log('⚠️  No users found - consider running seed script');
    } else {
      console.log('✅ Users collection populated');
    }
    
    if (productCount === 0) {
      console.log('⚠️  No products found - consider running seed script');
    } else {
      console.log('✅ Products collection populated');
    }
    
    const totalRecords = userCount + productCount + pricelistCount + orderCount + paymentCount + notificationCount + invoiceCount;
    
    if (totalRecords === 0) {
      console.log('\n❌ Database is empty!');
      console.log('💡 Run: npm run seed');
    } else {
      console.log(`\n✅ Database has ${totalRecords} total records`);
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run check if this file is executed directly
if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase };
