const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Pricelist = require('../models/Pricelist');

// Import fixed seed data
const fixedSeedData = require('./fixedSeedData');

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
    
    for (const userData of fixedSeedData.users) {
      // Hash password properly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      users.push({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        role: userData.role
      });
    }
    
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Seeded ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    return [];
  }
};

// Seed products
const seedProducts = async () => {
  try {
    console.log('📦 Seeding products...');
    const createdProducts = await Product.insertMany(fixedSeedData.products);
    console.log(`✅ Seeded ${createdProducts.length} products`);
    return createdProducts;
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    return [];
  }
};

// Seed pricelists
const seedPricelists = async (adminUser) => {
  try {
    console.log('💰 Seeding pricelists...');
    
    // Set the createdBy field to the admin user
    const pricelistsToCreate = fixedSeedData.pricelists.map(pricelist => ({
      ...pricelist,
      createdBy: adminUser ? adminUser._id : null
    }));
    
    const createdPricelists = await Pricelist.insertMany(pricelistsToCreate);
    console.log(`✅ Seeded ${createdPricelists.length} pricelists`);
    return createdPricelists;
  } catch (error) {
    console.error('❌ Error seeding pricelists:', error.message);
    return [];
  }
};

// Main seeding function
const seedDatabaseFixed = async () => {
  try {
    console.log('🌱 Starting database seeding (fixed version)...\n');
    
    await connectDB();
    
    console.log('⚠️  This will clear existing data and populate with sample data.');
    console.log('⚠️  Make sure you have a backup if needed.\n');
    
    // Ask user for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const shouldProceed = await new Promise((resolve) => {
      rl.question('🤔 Do you want to proceed? (y/N): ', (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    
    rl.close();
    
    if (!shouldProceed) {
      console.log('❌ Seeding cancelled');
      return;
    }
    
    await clearDatabase();
    
    // Seed users first
    const users = await seedUsers();
    const adminUser = users.find(user => user.role === 'admin');
    
    // Seed products
    const products = await seedProducts();
    
    // Seed pricelists (with admin user reference)
    const pricelists = await seedPricelists(adminUser);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`💰 Pricelists: ${pricelists.length}`);
    
    console.log('\n🔑 Default user credentials:');
    console.log('📧 Email: john.smith@email.com | 🔐 Password: password123 (Customer)');
    console.log('📧 Email: mike.davis@email.com | 🔐 Password: password123 (Admin)');
    
    console.log('\n💡 Next steps:');
    console.log('1. Check Swagger docs: http://localhost:8000/api-docs');
    console.log('2. Test login with the credentials above');
    console.log('3. Create some orders through the API');
    console.log('4. Test the frontend at http://localhost:5173');
    
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
  seedDatabaseFixed();
}

module.exports = { seedDatabaseFixed };
