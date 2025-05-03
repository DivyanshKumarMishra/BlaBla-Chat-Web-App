const User = require('../models/user')
const Channel = require('../models/channel')

const createChannel = async (req, res, next) => {
  try {
    const userId = req.userId 
    const {name, members, color} = req.body 
    if(!userId) throw {message: `You're not authorized`, status: 400, details: {missingParams: 'User not logged in'}}
    const admin = await User.findById(userId)
    if(!admin) throw {message: `You're not authorized`, status: 400, details: {missingParams: 'User not found'}}
    const validMembers = await User.find({_id: {$in: members}})
    if(validMembers.length !== members.length) throw {message: `Error searching contacts`, status: 400, details: {missingParams: `Some members are not valid users`}}
    const channel = new Channel({
      name: name,
      color: color,
      members: members,
      admin: [userId],
      createdAt: Date.now(),
    })
    const saved_channel = await channel.save({new: true})
    return res.status(201).json({channel:saved_channel})
  } catch (error) {
    return res.status(error.status || 500).json({message: error.message || `Error searching contacts`, details: error.details || {}});
  }
}

const getAllChannels = async (req, res, next) => {
  try {
    const userId = req.userId  
    if(!userId) throw {message: `You're not authorized`, status: 400, details: {missingParams: 'User not logged in'}}
    const user_channels = await Channel.find({
      $or: [{ members: userId }, { admin: userId }]
    }).sort({ updatedAt: -1 })
    return res.status(200).json({channels:user_channels})
  } catch (error) {
    return res.status(error.status || 500).json({message: error.message || `Error searching contacts`, details: error.details || {}});
  }
}

const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params
    if(!channelId) throw {message: `Could not load messages`, status: 400, details: {missingParams: 'Channel Id is required'}}
    const channel = await Channel.findById(channelId).sort({ updatedAt: -1 }).populate({path: 'messages', populate: {path: 'sender', select: 'name _id image color'}})
    if(!channel) throw {message: `Could not load messages`, status: 404, details: {missingParams: 'channel not found'}}
    const messages = channel.messages
    return res.status(200).json({messages})
  } catch (error) {
    return res.status(error.status || 500).json({message: error.message || `Error searching contacts`, details: error.details || {}});
  }
}

module.exports = { createChannel, getAllChannels, getChannelMessages }