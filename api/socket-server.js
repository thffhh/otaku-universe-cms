const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (Render এর জন্য জরুরি)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.IO Server is running',
    version: '1.0.0'
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'https://otaku-universe.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Connection handler
io.on('connection', (socket) => {
  const { userId, userName, userRole, userAvatar } = socket.handshake.auth || {};
  
  console.log(`✅ User connected: ${userName} (${userId})`);
  console.log(`📊 Total connections: ${io.engine.clientsCount}`);
  // Join sync room
  socket.join('live_sync_pool');
  
  // Send confirmation to client
  socket.emit('connected', { 
    message: 'Successfully connected to real-time server',
    userId,
    userName
  });

  // Handle state modifications
  socket.on('state_modified', (updatedDatabasePayload) => {
    console.log(`🔄 State modified by ${userName}:`, Object.keys(updatedDatabasePayload));
    
    // Broadcast to all clients in the room
    io.to('live_sync_pool').emit('state_update', {
      db: updatedDatabasePayload,
      updatedBy: userName,
      timestamp: new Date().toISOString()
    });
  });

  // Handle custom events (optional)
  socket.on('chat_message', (data) => {
    io.to('live_sync_pool').emit('chat_message', {
      ...data,
      userName,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${userName} (${userId})`);
    console.log(` Reason: ${reason}`);
    console.log(`📊 Remaining connections: ${io.engine.clientsCount}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`⚠️ Socket error for ${userName}:`, error.message);
  });
});

// Global error handling
io.engine.on('connection_error', (err) => {
  console.error('❌ Connection error:', err.message);
});
// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
