const mongoose = require('mongoose');
const PickupSlot = require('../models/PickupSlot');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sayantanhalder78:F0vDLk5Afmxx6rHb@renthive.4dl7vm0.mongodb.net/?retryWrites=true&w=majority&appName=RentHive';

const seedPickupSlots = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing pickup slots
    await PickupSlot.deleteMany({});
    console.log('🧹 Cleared existing pickup slots');

    // Create pickup slots for the next 7 days
    const today = new Date();
    const slots = [];

    // Default time slots
    const timeSlots = [
      { startTime: '09:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '13:00' },
      { startTime: '14:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '18:00' }
    ];

    // Default location
    const location = {
      name: 'RentHive Warehouse',
      address: 'Plot No. 123, Industrial Area, Phase 2, Mumbai - 400001',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    };

    // Find or create admin user
    const User = require('../models/User');
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      // Create a default admin user for seeding
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@renthive.com',
        password: 'password123', // This will be hashed automatically
        role: 'admin',
        phone: '+91 9876543210'
      });
      await adminUser.save();
      console.log('✅ Created default admin user for seeding');
    }
    
    const adminUserId = adminUser._id;

    // Create slots for next 7 days (excluding Sundays)
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() === 0) continue;

      for (const timeSlot of timeSlots) {
        const slot = {
          date: new Date(date),
          timeSlot,
          maxCapacity: 5,
          currentBookings: Math.floor(Math.random() * 3), // Random bookings 0-2
          location,
          isActive: true,
          notes: `Pickup slot for ${date.toLocaleDateString('en-IN')}`,
          createdBy: adminUserId
        };

        slots.push(slot);
      }
    }

    // Insert pickup slots
    const createdSlots = await PickupSlot.insertMany(slots);
    console.log(`✅ Created ${createdSlots.length} pickup slots`);

    // Print summary
    console.log('\n📊 Pickup Slots Summary:');
    console.log(`Total slots created: ${createdSlots.length}`);
    console.log(`Date range: ${new Date(today.getTime() + 24*60*60*1000).toLocaleDateString('en-IN')} to ${new Date(today.getTime() + 8*24*60*60*1000).toLocaleDateString('en-IN')}`);
    console.log(`Time slots per day: ${timeSlots.length}`);
    console.log(`Location: ${location.name}`);

    // Show some examples
    console.log('\n🔍 Sample pickup slots:');
    createdSlots.slice(0, 3).forEach(slot => {
      console.log(`- ${slot.date.toLocaleDateString('en-IN')} ${slot.timeSlot.startTime}-${slot.timeSlot.endTime} (${slot.currentBookings}/${slot.maxCapacity} booked)`);
    });

    console.log('\n🎉 Pickup slots seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding pickup slots:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting pickup slots seeding...');
  seedPickupSlots();
}

module.exports = seedPickupSlots;
