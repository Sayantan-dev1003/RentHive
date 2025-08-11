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

  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'dxsgg8qjg',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '231645679277236',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'UW32X0qAeb36X6a_qPh-ZpK9w4Y',
};
