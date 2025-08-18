const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const PickupSlot = require('../models/PickupSlot');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sayantanhalder78:F0vDLk5Afmxx6rHb@renthive.4dl7vm0.mongodb.net/?retryWrites=true&w=majority&appName=RentHive';

const inspectDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get database stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 DATABASE OVERVIEW');
    console.log('='.repeat(50));
    console.log(`Database: ${db.databaseName}`);
    console.log(`Collections: ${collections.length}`);
    
    // Inspect each collection
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }

    console.log('\n👥 USERS COLLECTION');
    console.log('='.repeat(50));
    const users = await User.find({}).select('name email role createdAt');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt?.toLocaleDateString()}`);
    });

    console.log('\n📦 PRODUCTS COLLECTION');
    console.log('='.repeat(50));
    const products = await Product.find({}).select('name category stock pricing isActive');
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - Stock: ${product.stock} - Active: ${product.isActive}`);
      if (product.pricing) {
        console.log(`  Pricing: Day: ₹${product.pricing.day}, Week: ₹${product.pricing.week}, Month: ₹${product.pricing.month}`);
      }
    });

    console.log('\n📋 ORDERS COLLECTION');
    console.log('='.repeat(50));
    const orders = await Order.find({})
      .populate('customerId', 'name email')
      .populate('pickupSlot.slotId', 'date timeSlot location')
      .select('customerId status paymentStatus totalAmount pickupSlot createdAt items');
    
    orders.forEach(order => {
      console.log(`- Order ${order._id.toString().slice(-6)} - Customer: ${order.customerId?.name || 'Unknown'}`);
      console.log(`  Status: ${order.status} | Payment: ${order.paymentStatus} | Amount: ₹${order.totalAmount}`);
      console.log(`  Items: ${order.items?.length || 0} | Created: ${order.createdAt?.toLocaleDateString()}`);
      if (order.pickupSlot?.slotId) {
        console.log(`  Pickup: ${order.pickupSlot.slotId.date?.toLocaleDateString()} ${order.pickupSlot.slotId.timeSlot?.startTime}-${order.pickupSlot.slotId.timeSlot?.endTime}`);
      }
    });

    console.log('\n💳 PAYMENTS COLLECTION');
    console.log('='.repeat(50));
    const payments = await Payment.find({})
      .populate('orderId', 'customerId totalAmount')
      .select('orderId amount status method createdAt');
    
    payments.forEach(payment => {
      console.log(`- Payment ${payment._id.toString().slice(-6)} - Amount: ₹${payment.amount}`);
      console.log(`  Status: ${payment.status} | Method: ${payment.method} | Date: ${payment.createdAt?.toLocaleDateString()}`);
    });

    console.log('\n🕐 PICKUP SLOTS COLLECTION');
    console.log('='.repeat(50));
    const pickupSlots = await PickupSlot.find({})
      .populate('createdBy', 'name')
      .select('date timeSlot maxCapacity currentBookings location isActive createdBy');
    
    pickupSlots.forEach(slot => {
      console.log(`- ${slot.date?.toLocaleDateString()} ${slot.timeSlot?.startTime}-${slot.timeSlot?.endTime}`);
      console.log(`  Capacity: ${slot.currentBookings}/${slot.maxCapacity} | Location: ${slot.location?.name}`);
      console.log(`  Active: ${slot.isActive} | Created by: ${slot.createdBy?.name || 'Unknown'}`);
    });

    // Generate analytics
    console.log('\n📈 ANALYTICS & INSIGHTS');
    console.log('='.repeat(50));
    
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const customerUsers = await User.countDocuments({ role: 'customer' });
    
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    
    const totalOrders = await Order.countDocuments();
    const reservedOrders = await Order.countDocuments({ status: 'reserved' });
    const pickedUpOrders = await Order.countDocuments({ status: 'picked_up' });
    const completedOrders = await Order.countDocuments({ status: 'returned' });
    
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'completed' });
    
    const totalPickupSlots = await PickupSlot.countDocuments();
    const activePickupSlots = await PickupSlot.countDocuments({ isActive: true });
    const bookedSlots = await PickupSlot.countDocuments({ currentBookings: { $gt: 0 } });

    console.log(`Users: ${totalUsers} total (${adminUsers} admins, ${customerUsers} customers)`);
    console.log(`Products: ${totalProducts} total (${activeProducts} active, ${outOfStockProducts} out of stock)`);
    console.log(`Orders: ${totalOrders} total (${reservedOrders} reserved, ${pickedUpOrders} picked up, ${completedOrders} completed)`);
    console.log(`Payments: ${totalPayments} total (${successfulPayments} successful)`);
    console.log(`Pickup Slots: ${totalPickupSlots} total (${activePickupSlots} active, ${bookedSlots} with bookings)`);

    // Revenue calculation
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    if (totalRevenue.length > 0) {
      console.log(`Total Revenue: ₹${totalRevenue[0].total.toLocaleString()}`);
    }

    // Recent activity
    console.log('\n🔄 RECENT ACTIVITY');
    console.log('='.repeat(50));
    
    const recentOrders = await Order.find({})
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('customerId status totalAmount createdAt');
    
    console.log('Last 5 Orders:');
    recentOrders.forEach(order => {
      console.log(`- ${order.customerId?.name || 'Unknown'} - ₹${order.totalAmount} - ${order.status} - ${order.createdAt?.toLocaleDateString()}`);
    });

    // Data quality checks
    console.log('\n🔍 DATA QUALITY CHECKS');
    console.log('='.repeat(50));
    
    const ordersWithoutCustomer = await Order.countDocuments({ customerId: { $exists: false } });
    const ordersWithoutPickupSlot = await Order.countDocuments({ 
      status: { $in: ['reserved', 'picked_up'] },
      'pickupSlot.slotId': { $exists: false }
    });
    const productsWithoutPricing = await Product.countDocuments({ pricing: { $exists: false } });
    
    console.log(`Orders without customer: ${ordersWithoutCustomer}`);
    console.log(`Paid orders without pickup slot: ${ordersWithoutPickupSlot}`);
    console.log(`Products without pricing: ${productsWithoutPricing}`);

    if (ordersWithoutPickupSlot > 0) {
      console.log('\n⚠️ WARNING: Some paid orders don\'t have pickup slots assigned!');
    }

    console.log('\n✅ Database inspection completed successfully!');
    
  } catch (error) {
    console.error('❌ Error inspecting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Utility functions for data management
const addSampleData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Adding sample data...');

    // Add sample products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'Professional Camera',
          category: 'Electronics',
          description: 'High-end DSLR camera perfect for events and photography',
          pricing: { hour: 200, day: 500, week: 3000, month: 10000 },
          stock: 5,
          isActive: true,
          rentable: true
        },
        {
          name: 'Laptop - MacBook Pro',
          category: 'Electronics',
          description: 'Latest MacBook Pro for business and creative work',
          pricing: { hour: 150, day: 400, week: 2500, month: 8000 },
          stock: 3,
          isActive: true,
          rentable: true
        },
        {
          name: 'Wedding Tent',
          category: 'Events',
          description: 'Large tent suitable for weddings and outdoor events',
          pricing: { hour: 500, day: 1200, week: 7000, month: 25000 },
          stock: 2,
          isActive: true,
          rentable: true
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('✅ Added sample products');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error adding sample data:', error);
    await mongoose.disconnect();
  }
};

// Run inspection if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--add-sample')) {
    console.log('🚀 Adding sample data...');
    addSampleData();
  } else {
    console.log('🚀 Starting database inspection...');
    inspectDatabase();
  }
}

module.exports = { inspectDatabase, addSampleData };
