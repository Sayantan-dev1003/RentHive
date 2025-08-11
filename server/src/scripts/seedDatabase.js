const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Pricelist = require('../models/Pricelist');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');

// Import seed data
const seedData = require('../seed/seedData.json');

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

// Clear existing data
const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Pricelist.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    await Invoice.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  }
};

// Seed users with proper password hashing
const seedUsers = async () => {
  try {
    console.log('👥 Seeding users...');
    const users = [];
    
    for (const userData of seedData.users) {
      // Hash password properly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt); // Default password
      
      users.push({
        ...userData,
        password: hashedPassword,
        // Update roles to match current system (customer/admin)
        role: userData.role === 'end_user' ? 'admin' : userData.role
      });
    }
    
    await User.insertMany(users);
    console.log(`✅ Seeded ${users.length} users`);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
};

// Seed products
const seedProducts = async () => {
  try {
    console.log('📦 Seeding products...');
    await Product.insertMany(seedData.products);
    console.log(`✅ Seeded ${seedData.products.length} products`);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  }
};

// Seed pricelists
const seedPricelists = async () => {
  try {
    console.log('💰 Seeding pricelists...');
    await Pricelist.insertMany(seedData.pricelists);
    console.log(`✅ Seeded ${seedData.pricelists.length} pricelists`);
  } catch (error) {
    console.error('❌ Error seeding pricelists:', error.message);
  }
};

// Seed orders
const seedOrders = async () => {
  try {
    console.log('📋 Seeding orders...');
    const orders = seedData.orders.map(order => ({
      ...order,
      // Ensure all required fields are present
      totalAmount: order.items.reduce((sum, item) => sum + item.priceApplied, 0),
      paidAmount: order.paymentStatus === 'completed' ? order.depositAmount : 0
    }));
    
    await Order.insertMany(orders);
    console.log(`✅ Seeded ${orders.length} orders`);
  } catch (error) {
    console.error('❌ Error seeding orders:', error.message);
  }
};

// Seed payments
const seedPayments = async () => {
  try {
    console.log('💳 Seeding payments...');
    await Payment.insertMany(seedData.payments);
    console.log(`✅ Seeded ${seedData.payments.length} payments`);
  } catch (error) {
    console.error('❌ Error seeding payments:', error.message);
  }
};

// Seed notifications
const seedNotifications = async () => {
  try {
    console.log('🔔 Seeding notifications...');
    const notifications = seedData.notifications.map(notification => ({
      ...notification,
      title: notification.title || getNotificationTitle(notification.type),
      isRead: false,
      channels: ['in_app', 'email']
    }));
    
    await Notification.insertMany(notifications);
    console.log(`✅ Seeded ${notifications.length} notifications`);
  } catch (error) {
    console.error('❌ Error seeding notifications:', error.message);
  }
};

// Seed invoices
const seedInvoices = async () => {
  try {
    console.log('📄 Seeding invoices...');
    const invoices = seedData.invoices.map(invoice => ({
      ...invoice,
      totalAmount: invoice.amount,
      pdfPath: null // Will be generated when needed
    }));
    
    await Invoice.insertMany(invoices);
    console.log(`✅ Seeded ${invoices.length} invoices`);
  } catch (error) {
    console.error('❌ Error seeding invoices:', error.message);
  }
};

// Helper function to generate notification titles
const getNotificationTitle = (type) => {
  const titles = {
    pickup_reminder: 'Pickup Reminder',
    return_reminder: 'Return Reminder',
    payment_due: 'Payment Due',
    late_return: 'Late Return Notice',
    system: 'System Notification',
    order_update: 'Order Update'
  };
  return titles[type] || 'Notification';
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await connectDB();
    
    // Ask user if they want to clear existing data
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const shouldClear = await new Promise((resolve) => {
      rl.question('⚠️  Do you want to clear existing data? (y/N): ', (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    
    rl.close();
    
    if (shouldClear) {
      await clearDatabase();
    }
    
    // Seed all collections
    await seedUsers();
    await seedProducts();
    await seedPricelists();
    await seedOrders();
    await seedPayments();
    await seedNotifications();
    await seedInvoices();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${seedData.users.length}`);
    console.log(`📦 Products: ${seedData.products.length}`);
    console.log(`💰 Pricelists: ${seedData.pricelists.length}`);
    console.log(`📋 Orders: ${seedData.orders.length}`);
    console.log(`💳 Payments: ${seedData.payments.length}`);
    console.log(`🔔 Notifications: ${seedData.notifications.length}`);
    console.log(`📄 Invoices: ${seedData.invoices.length}`);
    
    console.log('\n🔑 Default user credentials:');
    console.log('Email: john.smith@email.com | Password: password123 (Customer)');
    console.log('Email: mike.davis@email.com | Password: password123 (Admin)');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
