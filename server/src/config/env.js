require('dotenv').config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MongoDB configuration
  MONGODB_URI: process.env.MONGO_URI || 'mongodb+srv://sayantanhalder78:F0vDLk5Afmxx6rHb@renthive.4dl7vm0.mongodb.net/?retryWrites=true&w=majority&appName=RentHive',

  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};
