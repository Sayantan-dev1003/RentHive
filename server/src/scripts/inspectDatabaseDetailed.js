require('dotenv').config();

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://sayantanhalder78:F0vDLk5Afmxx6rHb@renthive.4dl7vm0.mongodb.net/?retryWrites=true&w=majority&appName=RentHive';

async function inspectDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Database has ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');

    // Inspect each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n📋 Collection: ${collectionName}`);
      console.log('=' .repeat(50));
      
      try {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`📈 Document count: ${count}`);
        
        if (count > 0) {
          // Get sample documents
          const samples = await db.collection(collectionName).find({}).limit(3).toArray();
          console.log(`\n🔍 Sample documents (first ${Math.min(3, count)}):`);
          
          samples.forEach((doc, index) => {
            console.log(`\n  Document ${index + 1}:`);
            console.log('  ' + JSON.stringify(doc, null, 2).replace(/\n/g, '\n  '));
          });
          
          // Get field statistics
          const pipeline = [
            { $project: { fields: { $objectToArray: "$$ROOT" } } },
            { $unwind: "$fields" },
            { $group: { _id: "$fields.k", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ];
          
          const fieldStats = await db.collection(collectionName).aggregate(pipeline).toArray();
          console.log(`\n📊 Field frequency (top 10):`);
          fieldStats.slice(0, 10).forEach(field => {
            console.log(`  ${field._id}: ${field.count} documents`);
          });
        } else {
          console.log('  ⚠️ Collection is empty');
        }
      } catch (error) {
        console.log(`  ❌ Error inspecting collection: ${error.message}`);
      }
    }

    // Specific analysis for key collections
    console.log('\n\n🔍 DETAILED ANALYSIS');
    console.log('=' .repeat(60));

    // Users analysis
    try {
      const users = await db.collection('users').find({}).toArray();
      console.log(`\n👥 USERS (${users.length} total):`);
      const usersByRole = {};
      users.forEach(user => {
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
      });
      Object.entries(usersByRole).forEach(([role, count]) => {
        console.log(`  ${role}: ${count} users`);
      });
    } catch (error) {
      console.log(`❌ Error analyzing users: ${error.message}`);
    }

    // Orders analysis
    try {
      const orders = await db.collection('orders').find({}).toArray();
      console.log(`\n📦 ORDERS (${orders.length} total):`);
      
      if (orders.length > 0) {
        const ordersByStatus = {};
        const ordersByPayment = {};
        let totalRevenue = 0;
        
        orders.forEach(order => {
          ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
          ordersByPayment[order.paymentStatus] = (ordersByPayment[order.paymentStatus] || 0) + 1;
          totalRevenue += order.totalAmount || 0;
        });
        
        console.log(`  📊 By Status:`);
        Object.entries(ordersByStatus).forEach(([status, count]) => {
          console.log(`    ${status}: ${count} orders`);
        });
        
        console.log(`  💳 By Payment Status:`);
        Object.entries(ordersByPayment).forEach(([status, count]) => {
          console.log(`    ${status}: ${count} orders`);
        });
        
        console.log(`  💰 Total Revenue: ₹${totalRevenue.toLocaleString()}`);
        console.log(`  📈 Average Order Value: ₹${Math.round(totalRevenue / orders.length).toLocaleString()}`);
        
        // Check for customer IDs and billing details
        const ordersWithCustomerId = orders.filter(o => o.customerId);
        const ordersWithBilling = orders.filter(o => o.billingDetails?.name);
        console.log(`  👤 Orders with Customer ID: ${ordersWithCustomerId.length}`);
        console.log(`  📋 Orders with Billing Details: ${ordersWithBilling.length}`);
      }
    } catch (error) {
      console.log(`❌ Error analyzing orders: ${error.message}`);
    }

    // Products analysis
    try {
      const products = await db.collection('products').find({}).toArray();
      console.log(`\n📦 PRODUCTS (${products.length} total):`);
      
      if (products.length > 0) {
        const productsByCategory = {};
        const activeProducts = products.filter(p => p.isActive);
        
        products.forEach(product => {
          productsByCategory[product.category] = (productsByCategory[product.category] || 0) + 1;
        });
        
        console.log(`  ✅ Active Products: ${activeProducts.length}`);
        console.log(`  📊 By Category:`);
        Object.entries(productsByCategory).forEach(([category, count]) => {
          console.log(`    ${category}: ${count} products`);
        });
      }
    } catch (error) {
      console.log(`❌ Error analyzing products: ${error.message}`);
    }

    // Pickup Slots analysis
    try {
      const pickupSlots = await db.collection('pickupslots').find({}).toArray();
      console.log(`\n🕐 PICKUP SLOTS (${pickupSlots.length} total):`);
      
      if (pickupSlots.length > 0) {
        const activeSlots = pickupSlots.filter(s => s.isActive);
        const bookedSlots = pickupSlots.filter(s => s.currentBookings > 0);
        
        console.log(`  ✅ Active Slots: ${activeSlots.length}`);
        console.log(`  📅 Slots with Bookings: ${bookedSlots.length}`);
        
        const totalCapacity = pickupSlots.reduce((sum, slot) => sum + (slot.maxCapacity || 0), 0);
        const totalBookings = pickupSlots.reduce((sum, slot) => sum + (slot.currentBookings || 0), 0);
        
        console.log(`  📊 Total Capacity: ${totalCapacity}`);
        console.log(`  📈 Total Bookings: ${totalBookings}`);
        console.log(`  📉 Utilization: ${totalCapacity > 0 ? ((totalBookings / totalCapacity) * 100).toFixed(1) : 0}%`);
      }
    } catch (error) {
      console.log(`❌ Error analyzing pickup slots: ${error.message}`);
    }

    console.log('\n✅ Database inspection completed!');

  } catch (error) {
    console.error('❌ Database inspection failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the inspection
inspectDatabase().catch(console.error);
