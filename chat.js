// socket/chatSocket.js
const onlineUsers = {};

module.exports = (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('login', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`User ${userId} is online.`);
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );
    delete onlineUsers[userId];
    console.log(`User ${userId} is offline.`);
  });

  socket.on('chat:message', (data) => {
    const { recipientId, message } = data;
    const recipientSocketId = onlineUsers[recipientId];
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('chat:message', {
        senderId: socket.id,
        message,
      });
    }
  });
};