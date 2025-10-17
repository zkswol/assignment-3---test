const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Import configuration
const connectDB = require('./config/database');
const { PORT } = require('./config/constants');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const inventoryRoutes = require('./routes/inventory');
const aiRoutes = require('./routes/ai');
const statsRoutes = require('./routes/stats');

// Import services
const SocketService = require('./services/socketService');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const socketService = new SocketService(server);

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/', authRoutes);
app.use('/', recipeRoutes);
app.use('/', inventoryRoutes);
app.use('/', aiRoutes);
app.use('/', statsRoutes);
app.use(express.static("./dist/frontend/browser"));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = { app, server };
