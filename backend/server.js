const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const os = require('os');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const financeRoutes = require('./routes/finance');
const logsRoutes = require('./routes/logs');
const servicesRoutes = require('./routes/services');
const appointmentRoutes = require('./routes/appointments');
const mobileLabRoutes = require('./routes/mobileLab');
const testResultRoutes = require('./routes/testResults'); // Re-enabled for test result functionality

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import models for session management
const User = require('./models/User');

// Get local IP address for display and MongoDB connection
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
};

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting - Increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 for development
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow network access
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    /^http:\/\/192\.168\.\d+\.\d+:5173$/, // Allow any 192.168.x.x IP on port 5173
    /^http:\/\/192\.168\.\d+\.\d+:5174$/, // Allow any 192.168.x.x IP on port 5174
    /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,   // Allow any 10.x.x.x IP on port 5173
    /^http:\/\/10\.\d+\.\d+\.\d+:5174$/,   // Allow any 10.x.x.x IP on port 5174
    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:5173$/, // Allow 172.16-31.x.x IPs on port 5173
    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:5174$/ // Allow 172.16-31.x.x IPs on port 5174
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Additional CORS headers middleware (fallback)
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Access Logging Middleware
const Log = require('./models/Log');
app.use(async (req, res, next) => {
  // Only log certain API endpoints to avoid spam
  if (req.path.startsWith('/api/') && 
      !req.path.includes('/health') && 
      !req.path.includes('/ping') &&
      !req.path.includes('/logs')) { // Don't log the logs endpoint to avoid recursion
    
    try {
      // Get user email from request if authenticated
      const userEmail = req.user?.email || 'anonymous';
      const action = `${req.method} ${req.path}`;
      const details = `API Access: ${req.method} ${req.path}${req.query ? ' - Query: ' + JSON.stringify(req.query) : ''}`;
      
      // Log the API access asynchronously (don't wait for it)
      Log.logInfo(
        action,
        details,
        userEmail,
        req.ip || req.connection.remoteAddress || '127.0.0.1',
        { 
          method: req.method, 
          path: req.path, 
          query: req.query,
          userAgent: req.get('User-Agent')
        }
      ).catch(err => {
        console.error('Failed to log API access:', err);
      });
    } catch (error) {
      console.error('Error in API logging middleware:', error);
    }
  }
  next();
});

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
app.use('/api/logs', logsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/mobile-lab', mobileLabRoutes);
app.use('/api/test-results', testResultRoutes); // Re-enabled for test result functionality

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection with better error handling and network support
const getMongoURI = () => {
  const baseURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT';
  
  // If we're running in network mode (backend accessible from network IP), 
  // we need to ensure MongoDB URI uses the correct address
  const localIP = getLocalIP();
  
  // If the backend is accessed via network IP, try to use that for MongoDB too
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Network IP detected: ${localIP}`);
    console.log(`📝 Original MongoDB URI: ${baseURI}`);
    
    // For network access, we'll try multiple URIs if needed
    return baseURI;
  }
  
  return baseURI;
};

const mongoURI = getMongoURI();
console.log('🔗 Using MongoDB URI:', mongoURI);

// Enhanced MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Smart MongoDB connection with fallback
const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoURI, mongoOptions);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    
    // In development, try alternative connection approaches
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Trying alternative MongoDB connection methods...');
      
      // Try with network IP if available
      const localIP = getLocalIP();
      if (localIP && localIP !== 'localhost' && mongoURI.includes('localhost')) {
        const networkURI = mongoURI.replace('localhost', localIP);
        console.log(`🌐 Attempting network URI: ${networkURI}`);
        
        try {
          await mongoose.connect(networkURI, mongoOptions);
          console.log('✅ MongoDB connected via network URI');
          return;
        } catch (networkErr) {
          console.error('❌ Network URI connection failed:', networkErr.message);
        }
      }
      
      // Retry with original URI
      console.log('🔄 Retrying original MongoDB connection in 5 seconds...');
      setTimeout(() => {
        connectMongoDB();
      }, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Initial connection attempt
connectMongoDB();

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
  
  // Start session cleanup task (runs every hour)
  setInterval(async () => {
    try {
      const result = await User.cleanupExpiredSessions();
      if (result.modifiedCount > 0) {
        console.log(`🧹 Cleaned up ${result.modifiedCount} expired sessions`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
  
  // Run cleanup immediately on startup
  setTimeout(async () => {
    try {
      const result = await User.cleanupExpiredSessions();
      if (result.modifiedCount > 0) {
        console.log(`🧹 Initial cleanup: removed ${result.modifiedCount} expired sessions`);
      }
    } catch (error) {
      console.error('❌ Error in initial session cleanup:', error);
    }
  }, 5000); // Run after 5 seconds to ensure database is ready
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
  
  // Attempt to reconnect in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Attempting to reconnect to MongoDB...');
    setTimeout(() => {
      mongoose.connect(mongoURI, mongoOptions);
    }, 5000);
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

// Periodic health monitoring to keep server active
setInterval(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.rss > 1000000000) { // 1GB threshold
    console.log('⚠️ High memory usage detected:', Math.round(memUsage.rss / 1024 / 1024), 'MB');
  }
}, 300000); // Check every 5 minutes

// Graceful shutdown handling
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
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

const localIP = getLocalIP();

// Enhanced server configuration
const server = app.listen(PORT, HOST, () => {
  console.log(`
🚀 MDLAB Direct Backend Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Host: ${HOST} (Listening on all network interfaces)
🔌 Port: ${PORT}
�️  Local Access: http://localhost:${PORT}/api
🌍 Network Access: http://${localIP}:${PORT}/api
📊 Health Check: http://${localIP}:${PORT}/api/health
💾 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}

📱 Access from other devices on your network:
   Frontend: http://${localIP}:5173
   Backend API: http://${localIP}:${PORT}/api
  `);
});

// Set server timeout to prevent hanging connections
server.timeout = 300000; // 5 minutes instead of 2
server.keepAliveTimeout = 120000; // 2 minutes
server.headersTimeout = 121000; // 2 minutes + 1 second

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
