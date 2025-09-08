require('dotenv').config();
const { Server: SocketIOServer } = require('socket.io');
const Message = require('./models/message');
const Chat = require('./models/chat');

const setupCircuit = (server) => {
  const io = new SocketIOServer(server, {
    // pingTimeout: 60000,
    cors: {
      origin: process.env.ORIGIN,
      credentials: true,
    },
  });

  const userMap = new Map();

  io.on('connection', (socket) => {
    // console.log(`socket ${socket.id} connected`);
    // socket.on('online-status', () => {
    //   // console.log('online-status', userMap);
    //   const onlineUsers = Array.from(userMap.keys());
    //   io.to(socket.id).emit('online-status', onlineUsers);
    // });

    socket.on('setup', async (userId) => {
      userMap.set(userId, socket.id);
      // socket.broadcast.emit('online', userId);

      // functionality to deliver pending messages when user is online
      const chats = await Chat.find(
        {
          members: userId,
        },
        { _id: 1 }
      );

      const chatIds = chats.map((chat) => chat._id);
      const pendingMessages = await Message.find({
        state: 'pending',
        sender: { $ne: userId },
        chat: { $in: chatIds },
      })
        .populate('sender', '-password')
        .populate({
          path: 'chat',
          populate: { path: 'members', select: 'name image email _id' },
        });

      await Message.updateMany(
        {
          state: 'pending',
          _id: { $in: pendingMessages.map((message) => message._id) },
        },
        { state: 'delivered' }
      );

      pendingMessages.forEach((message) => {
        io.to(socket.id).emit('message-received', message);
      });
    });

    socket.on('join-chat', (roomId) => {
      // console.log(`user joined the room ${roomId}`);
      socket.join(roomId);
    });

    // sending the message to every member except the sender
    socket.on('new-message', async (newMessage) => {
      // console.log(newMessage);
      var chat = newMessage.chat;
      if (chat.members?.length < 1) {
        console.log('chat is not defined');
        return;
      }

      for (const member of chat.members) {
        if (member._id !== newMessage.sender._id) {
          const socketId = userMap.get(member._id);
          if (!socketId) continue;

          // if the user is online then only deliver the messages
          // when sending received message mark status to delivered
          await Message.updateOne(
            {
              state: 'pending',
              _id: newMessage._id,
            },
            { state: 'delivered' }
          );

          io.to(socketId).emit('message-received', newMessage);
        }
      }
    });

    socket.on('typing', ({ userId, roomId }) => {
      socket.to(roomId).emit('typing', { userId, roomId });
    });

    socket.on('stop-typing', ({ userId, roomId }) => {
      socket.to(roomId).emit('stop-typing', { userId, roomId });
    });

    socket.on('leave-chat', (roomId) => {
      // console.log(`user left the room ${roomId}`);
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userMap) {
        if (socketId === socket.id) {
          userMap.delete(userId);
          // socket.broadcast.emit('offline', userId);
          break;
        }
      }
    });
  });

  return io;
};

module.exports = { setupCircuit };
