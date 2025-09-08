const { sendErrorResponse } = require('../utils');
const Message = require('../models/message');
const Chat = require('../models/chat');

const sendMessage = async (req, res, next) => {
  try {
    const { content, chatId, messageType, fileUrl } = req.body;
    const mtype = messageType.toLowerCase();
    if (!chatId) return sendErrorResponse(res, 'chatId is required', 400);
    if (mtype === 'file' && !fileUrl)
      return sendErrorResponse(res, 'fileUrl is required', 400);
    if (mtype === 'text' && !content)
      return sendErrorResponse(res, 'content is required', 400);

    const messageBody = {
      sender: req.userId,
      chat: chatId,
      messageType: mtype,
    };

    if (mtype === 'file') messageBody.fileUrl = fileUrl;
    if (mtype === 'text') messageBody.content = content;

    const new_message = new Message(messageBody);

    const saved_message = await new_message.save(new_message);
    const populated_message = await Message.findOne({ _id: saved_message._id })
      .populate('sender', '-password')
      .populate({
        path: 'chat',
        populate: { path: 'members', select: 'name image email' },
      });
    await Chat.findOneAndUpdate(
      { _id: chatId },
      { latestMessage: populated_message._id }
    );
    return res.status(200).json(populated_message);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const fetchChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', '-password')
      .populate('chat');

    if (messages.length <= 0)
      return sendErrorResponse(res, 'No messages found', 400);
    return res.status(200).json(messages);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

module.exports = { sendMessage, fetchChatMessages };
