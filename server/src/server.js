const app = require('./app');
require('dotenv').config();

// Import notification scheduler
require('./cron/notificationScheduler');

const PORT = process.env.PORT || 5001;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 RentHive API Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = server;
