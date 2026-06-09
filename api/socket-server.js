import { Server } from 'socket.io';

export default function SocketHandler(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO...');
    
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: '*', // আপনার ফ্রন্টএন্ড URL দিন
        methods: ['GET', 'POST']
      }
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      const { userId, userName, userRole } = socket.handshake.auth;
      console.log(`User ${userName} connected for real-time streaming.`);

      // Join channel or presence room
      socket.join('live_sync_pool');

      // On State Alteration
      socket.on('state_modified', (updatedDatabasePayload) => {
        // Broadcast state update to all active Front-end instances
        io.to('live_sync_pool').emit('state_update', {
          db: updatedDatabasePayload
        });
      });

      socket.on('disconnect', () => {
        console.log(`User ${userName} disconnected`);
      });
    });
  }
  
  res.end();
}
