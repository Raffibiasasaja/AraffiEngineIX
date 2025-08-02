require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Database connection
const database = require('./config/database');

// Routes
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

/**
 * Express Server for Bakso Kangen API
 * A comprehensive meatball ordering platform
 */

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting when behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-New-Token'] // For token refresh
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bakso Kangen API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Bakso Kangen API',
    version: '1.0.0',
    documentation: {
      authentication: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders'
    },
    endpoints: {
      health: '/health',
      docs: '/api/docs'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Serve static files from frontend build (if available)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

/**
 * Start server and connect to database
 */
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Bakso Kangen API Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔧 Development URLs:`);
        console.log(`   Frontend: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
        console.log(`   Backend:  http://localhost:${PORT}`);
        console.log(`   API:      http://localhost:${PORT}/api`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📔 SIGTERM received. Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📔 SIGINT received. Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;