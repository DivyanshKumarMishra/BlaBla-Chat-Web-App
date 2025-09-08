const express = require('express');
const {
  createOrAccessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addGroupMembers,
  removeGroupMembers,
} = require('../controllers/chat');
const chatRouter = express.Router();

chatRouter.use((req, res, next) => {
  next();
});

// direct-message controllers
chatRouter.post('/', createOrAccessChat);
chatRouter.get('/get-all', fetchChats);

// group controllers
chatRouter.post('/group/create', createGroupChat);
chatRouter.post('/group/rename', renameGroup);
chatRouter.post('/group/add-member', addGroupMembers);
chatRouter.post('/group/remove-member', removeGroupMembers);

module.exports = chatRouter;
