const app = require('./app');
require('dotenv').config();
const { Server } = require('socket.io');
const http = require('http');

// Import database connection
const connectDB = require('./config/db');

// Import schedulers
require('./cron/notificationScheduler');
require('./cron/lateFeeScheduler');

// Import socket utilities
const { initializeSocket } = require('./utils/socket');

const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize socket utilities
initializeSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 RentHive API Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔌 Socket.io initialized for real-time updates`);
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
