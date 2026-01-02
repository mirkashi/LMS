const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// Make io accessible to our router
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/9tangle';
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.warn('⚠️ MongoDB connection failed, continuing with app (using mock data):', err.message);
});

// PostgreSQL Connection (optional)
let sequelize;
const pgEnabled = String(process.env.DB_ENABLED || 'true') !== 'false';
if (pgEnabled) {
  sequelize = new Sequelize(
    process.env.DB_NAME || '9tangle',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );

  sequelize.authenticate()
    .then(() => console.log('✅ PostgreSQL connected'))
    .catch(err => console.error('PostgreSQL connection error:', err));
} else {
  console.log('ℹ️ PostgreSQL disabled via DB_ENABLED=false');
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = { app, sequelize, io };
