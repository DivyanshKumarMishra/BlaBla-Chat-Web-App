const User = require('../models/user');
const Message = require('../models/message');
const { sendErrorResponse } = require('../utils');
const mongoose = require('mongoose');

const searchContacts = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const searchText = req.query.search;
    let contacts = [];
    if (!searchText) {
      contacts = await User.find({ _id: { $ne: userId } });
    } else {
      const regex = new RegExp(searchText, 'i');
      contacts = await User.find({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [{ name: regex }, { email: regex }],
          },
        ],
      });
    }

    if (contacts.length <= 0) {
      return sendErrorResponse(res, 'No contacts found', 400);
    }

    return res.status(200).json({ contacts });
  } catch (error) {
    return sendErrorResponse(res, {
      message: error.message || `Error searching contacts`,
      details: error.details || {},
    });
  }
};

module.exports = { searchContacts };
