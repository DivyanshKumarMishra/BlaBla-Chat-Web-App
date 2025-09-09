const Chat = require('../models/chat');
const User = require('../models/user');
const { sendErrorResponse } = require('../utils');

const createOrAccessChat = async (req, res, next) => {
  try {
    const senderId = req.userId;
    if (!senderId) return sendErrorResponse(res, 'Not Authorized', 401);

    const { receiverId } = req.body;
    if (!receiverId)
      return sendErrorResponse(res, 'receiver required to start a chat', 400);

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [senderId, receiverId] },
    })
      .populate('members', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name image email' },
      });

    if (!chat) {
      const receiver = await User.findById(receiverId);
      const newChat = await Chat.create({
        name: 'sender',
        members: [senderId, receiverId],
      });

      chat = await newChat.populate('members', '-password');
    }

    return res.status(200).json(chat);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const fetchChats = async (req, res, next) => {
  try {
    const loggedInUserId = req.userId;
    if (!loggedInUserId) return sendErrorResponse(res, 'Not Authorized', 401);

    const chats = await Chat.find({ members: { $all: [loggedInUserId] } })
      .populate('admin', '-password')
      .populate('members', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name image email' },
      })
      .sort({ updatedAt: -1 });

    // if (chats.length < 0) return sendErrorResponse(res, 'No chats found', 400);
    return res.status(200).json(chats);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const createGroupChat = async (req, res, next) => {
  try {
    const loggedInUserId = req.userId;
    if (!loggedInUserId) return sendErrorResponse(res, 'Not Authorized', 401);

    const { name, members } = req.body;
    if (!name || !members)
      return sendErrorResponse(res, 'name and members are required', 400);

    if (members.length < 2)
      return sendErrorResponse(res, 'at least 2 members are required', 400);

    const newGroup = await Chat.create({
      name,
      isGroupChat: true,
      members: [...members, loggedInUserId],
      admin: loggedInUserId,
    });

    const groupChat = await Chat.findOne({ _id: newGroup._id })
      .populate('members', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name image email' },
      });

    return res.status(200).json(groupChat);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const renameGroup = async (req, res, next) => {
  try {
    const { name, chatId } = req.body;
    if (!name || !chatId)
      return sendErrorResponse(res, 'name and chatId are required', 400);

    const chat = await Chat.findById({ _id: chatId });
    if (!chat) return sendErrorResponse(res, "Chat doesn't exist", 400);

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { name },
      { new: true }
    )
      .populate('members', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name image email' },
      });

    return res.status(200).json(updatedChat);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const addGroupMembers = async (req, res, next) => {
  try {
    const { chatId, userIds } = req.body;
    if (!chatId || !userIds)
      return sendErrorResponse(res, 'chatId and userIds are required', 400);

    if (userIds.length < 1)
      return sendErrorResponse(res, 'at least 1 userId is required', 400);

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) return sendErrorResponse(res, "Chat doesn't exist", 400);

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $push: { members: userIds },
      },
      { new: true }
    )
      .populate('members', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name image email' },
      });
    return res.status(200).json(updatedChat);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const removeGroupMembers = async (req, res, next) => {
  try {
    const { chatId, userIds } = req.body;
    if (!chatId || !userIds)
      return sendErrorResponse(res, 'chatId and userIds are required', 400);

    if (userIds.length < 1)
      return sendErrorResponse(res, 'at least 1 userId is required', 400);

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) return sendErrorResponse(res, "Chat doesn't exist", 400);

    const isAdminLeaving = userIds.includes(req.userId);
    const updateQuery = {
      $pull: { members: { $in: userIds } },
    };

    if (isAdminLeaving) {
      updateQuery.$set = { admin: null };
    }

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      updateQuery,
      { new: true }
    )
      .populate('members', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name image email' },
      });
    return res.status(200).json(updatedChat);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

module.exports = {
  createOrAccessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addGroupMembers,
  removeGroupMembers,
};
