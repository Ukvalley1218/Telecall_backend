require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 Telecalling App Backend Server Started!              ║
  ║                                                           ║
  ║   Port: ${PORT}                                            ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
  ║                                                           ║
  ║   API Endpoints:                                          ║
  ║   - Auth:    http://localhost:${PORT}/api/auth             ║
  ║   - Upload:  http://localhost:${PORT}/api/upload           ║
  ║   - Health:  http://localhost:${PORT}/api/health           ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});