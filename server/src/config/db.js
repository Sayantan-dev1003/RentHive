const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment or use default
    let mongoURI = process.env.MONGO_URI || 'mongodb+srv://sayantanhalder78:F0vDLk5Afmxx6rHb@renthive.4dl7vm0.mongodb.net/?retryWrites=true&w=majority&appName=RentHive';
    
    // Ensure database name is specified
    if (mongoURI.includes('mongodb+srv://') && !mongoURI.includes('.net/') && mongoURI.includes('.net/?')) {
      mongoURI = mongoURI.replace('.net/?', '.net/RentHive?');
    } else if (mongoURI.includes('mongodb+srv://') && mongoURI.includes('.net/?') && !mongoURI.includes('.net/RentHive?')) {
      mongoURI = mongoURI.replace('.net/?', '.net/RentHive?');
    }
    
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Connection URI: ${mongoURI.replace(/:[^:@]*@/, ':****@')}`); // Hide password
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error(`   Message: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.error('   📡 This appears to be a network connectivity issue.');
      console.error('   💡 Please check:');
      console.error('      - Your internet connection');
      console.error('      - MongoDB Atlas IP whitelist settings');
      console.error('      - Your MongoDB Atlas connection string in .env file');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('   🔐 Authentication failed.');
      console.error('   💡 Please check:');
      console.error('      - Database username and password in connection string');
      console.error('      - Database user permissions');
    }
    
    console.error('   📄 See server/env-setup-guide.md for setup instructions');
    process.exit(1);
  }
};

module.exports = connectDB;