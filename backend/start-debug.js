const app = require('./server-debug');
const mongoose = require('mongoose');
const os = require('os');

// Get local IP address
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

const networkIP = getLocalIP();
console.log('🔍 Network IP detected:', networkIP);

// MongoDB connection with enhanced error handling
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/MDLAB_DIRECT';
console.log('📝 Original MongoDB URI:', mongoURI);

const connectDB = async () => {
  try {
    console.log('💾 MongoDB: Connecting...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('📡 Mongoose connected to MongoDB');
    console.log('✅ MongoDB connected successfully');
    
    // Clean up expired sessions on startup
    try {
      const User = require('./models/User');
      await User.cleanupExpiredSessions();
    } catch (error) {
      console.error('⚠️ Error cleaning up expired sessions:', error.message);
    }
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Enhanced error handling for MongoDB
mongoose.connection.on('error', (err) => {
  console.error('💥 MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
  console.log('🔄 Attempting to reconnect to MongoDB...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ Mongoose reconnected to MongoDB');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close HTTP server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('📴 HTTP server closed');
          resolve();
        });
      });
    }
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed');
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle process signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start HTTP server
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 MDLAB Direct Backend Server is running!');
      console.log('📍 Environment:', process.env.NODE_ENV || 'development');
      console.log('🌐 Host: 0.0.0.0 (Listening on all network interfaces)');
      console.log('🔌 Port:', PORT);
      console.log('🏠 Local Access: http://localhost:' + PORT + '/api');
      console.log('🌍 Network Access: http://' + networkIP + ':' + PORT + '/api');
      console.log('📊 Health Check: http://' + networkIP + ':' + PORT + '/api/health');
      console.log('');
      console.log('📱 Access from other devices on your network:');
      console.log('   Frontend: http://' + networkIP + ':5173');
      console.log('   Backend API: http://' + networkIP + ':' + PORT + '/api');
    });

    // Enhanced server error handling
    server.on('error', (error) => {
      console.error('💥 Server error:', error);
      
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();