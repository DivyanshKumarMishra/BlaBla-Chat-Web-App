require('dotenv').config()
const {Server: SocketIOServer} = require('socket.io')
const Message = require('./models/message')
const Channel = require('./models/channel')
const mongoose = require('mongoose')

const userSocketMap = new Map()

const setupCircuit = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    }
  })

  const disconnect = async (socket_id) => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket_id) {
        // console.log(`User disconnected: ${userId}`);
        userSocketMap.delete(userId);
        break;
      }
    }
  }

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender)
    const receiverSocketId = userSocketMap.get(message.receiver)
    const new_message = await new Message(message).save({new: true})
    const saved_message = await Message.findById(new_message._id).populate([
      { path: 'sender', select: '_id name email color image' },
      { path: 'receiver', select: '_id name email color image' }
    ]);
    // console.log(`sending message: ${saved_message.content}`);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive-message', saved_message)
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit('receive-message', saved_message)
    }
  }

  io.on('connection', socket => {
    const userId = socket.handshake.query.userId

    if (userId) {
      userSocketMap.set(userId, socket.id)
      // console.log(`User connected: ${userId} with socket ID: ${socket.id}`)
    } else {
      console.log('User ID not provided')
    }
    
    socket.on('send-message', sendMessage)
    socket.on('send-channel-message', sendChannelMessage)

    socket.on('disconnect', () => {
      disconnect(socket.id)
    })
  })

  const sendChannelMessage = async (message) => {
    const {channelId} = message
    const new_message = await new Message(message).save({new: true})
    const saved_message = await Message.findById(new_message._id).populate([
      { path: 'sender', select: '_id name email color image' },
    ]);
    await Channel.findOneAndUpdate(
      {_id: new mongoose.Types.ObjectId(channelId)},
      {$push: {messages: saved_message._id}},
      {new: true},
    )
    const updated_channel = await Channel.findById(channelId).populate('members');
    const finalData = {...saved_message._doc, channelId: updated_channel._id}
    if(updated_channel && updated_channel.members.length){
      updated_channel.members.forEach(member => {
        const memberSocketId = userSocketMap.get(member._id.toString())
        memberSocketId && io.emit('receive-channel-message', finalData)
      })
      const adminSocketId = userSocketMap.get(updated_channel.admin._id.toString())
      adminSocketId && io.emit('receive-channel-message', finalData)
    }
  }

  return io
}

module.exports = { setupCircuit }