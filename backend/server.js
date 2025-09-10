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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MDLAB Direct API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
console.log('MONGODB_URI:', process.env.MONGODB_URI);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 MDLAB Direct Backend Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🔗 API Base URL: http://localhost:${PORT}/api
📊 Health Check: http://localhost:${PORT}/api/health
  `);
});

module.exports = app;
