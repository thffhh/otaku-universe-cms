require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

const connectDB = require('./config/db');
const socketManager = require('./socket/index');

// Routes Import
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json()); // JSON data parse করার জন্য

// Database Connect
connectDB();

// API Routes Setup
app.use('/api/auth', authRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: "🚀 Otaku Universe CMS V4 Backend is Running!" });
});

// 🔥 HTTP Server তৈরি করে Socket.io এর সাথে যুক্ত করা
const server = http.createServer(app);
const io = socketManager.init(server);

// Global IO instance কে Controllers এ ব্যবহার করার জন্য app locals এ সেট করা
app.set('io', io);

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
