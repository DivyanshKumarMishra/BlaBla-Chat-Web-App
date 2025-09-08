const express = require('express');
const { fetchChatMessages, sendMessage } = require('../controllers/message');
const messageRouter = express.Router();

messageRouter.get('/:chatId', fetchChatMessages);
messageRouter.post('/', sendMessage);

module.exports = messageRouter;
