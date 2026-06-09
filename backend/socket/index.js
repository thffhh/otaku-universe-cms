let io;

module.exports = {
  init: function (httpServer) {
    const socketio = require('socket.io');
    
    io = socketio(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log(`🟢 New WebSocket Connected: ${socket.id}`);

      // যখন কেউ নতুন এপিসোড আপলোড করবে
      socket.on('episode_uploaded', (data) => {
        console.log(`🔥 New Episode Uploaded: ${data.animeName} - Ep ${data.episode}`);
        // সব কানেক্টেড ক্লায়েন্টকে (Frontend) নোটিফিকেশন পাঠাবে
        io.emit('new_episode_notification', data);
      });

      socket.on('disconnect', () => {
        console.log(`🔴 WebSocket Disconnected: ${socket.id}`);
      });
      });

    return io;
  },

  getIO: function () {
    if (!io) {
      throw new Error("Socket.io not initialized! Call init() first.");
    }
    return io;
  }
};
