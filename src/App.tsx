socketInstance = io(activeSocketUrl, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 8,
  auth: { userId, userName, userRole, userAvatar }
});
