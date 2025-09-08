const express = require('express');
const userRouter = express.Router();
const { getUserInfo, updateProfileInfo } = require('../controllers/profile');
const { searchContacts } = require('../controllers/contacts');

userRouter.get('/user-info', getUserInfo);
userRouter.post('/update-profile', updateProfileInfo);
userRouter.get('/contacts', searchContacts);

module.exports = userRouter;
