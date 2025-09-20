const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const financeRoutes = require('./routes/finance');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow network access
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    /^http:\/\/192\.168\.\d+\.\d+:5174$/, // Allow any 192.168.x.x IP
    /^http:\/\/10\.\d+\.\d+\.\d+:5174$/,   // Allow any 10.x.x.x IP  
    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:5174$/ // Allow 172.16-31.x.x IPs
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files for profile pictures
app.use('/profile-pics', express.static(path.join(__dirname, 'public/profile-pics')));

// Health check endpoint with enhanced monitoring
app.get('/api/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: 'MDLAB Direct API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      status: mongoose.connection.readyState,
      statusText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
    },
    memory: process.memoryUsage(),
    pid: process.pid
  };
  
  res.status(200).json(healthCheck);
});

// Keep-alive endpoint to prevent idle disconnections
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/finance', financeRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection with better error handling and reconnection
const mongoURI = process.env.MONGODB_URI;
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Enhanced MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect(mongoURI, mongoOptions)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

// Handle MongoDB connection termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

// Enhanced error handling for unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  
  // Log the error but DON'T crash the server in development
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Gracefully shutting down server...');
    server.close(() => {
      process.exit(1);
    });
  } else {
    console.log('⚠️ Server continuing in development mode...');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  
  // In development, log and continue; in production, gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Shutting down due to uncaught exception...');
    process.exit(1);
  } else {
    console.log('⚠️ Server continuing in development mode...');
  }
});

const PORT = process.env.PORT || 5000;

// Enhanced server configuration
const server = app.listen(PORT, () => {
  console.log(`
🚀 MDLAB Direct Backend Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🔗 API Base URL: http://localhost:${PORT}/api
📊 Health Check: http://localhost:${PORT}/api/health
💾 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}
  `);
});

// Set server timeout to prevent hanging connections
server.timeout = 120000; // 2 minutes
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('📴 HTTP server closed');
    
    try {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed');
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during MongoDB shutdown:', err);
      process.exit(1);
    }
  });
  
  // Force close server after 30 seconds
  setTimeout(() => {
    console.error('⏰ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Keep the process alive and handle any unexpected termination
process.on('exit', (code) => {
  console.log(`👋 Process exited with code: ${code}`);
});

// Prevent the process from crashing on Windows Ctrl+C
if (process.platform === "win32") {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", () => {
    process.emit("SIGINT");
  });
}

module.exports = app;
