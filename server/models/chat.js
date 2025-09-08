const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    members: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    admin: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.isGroupChat;
      },
    },
    messages: [{ type: mongoose.Types.ObjectId, ref: 'Message' }],
    latestMessage: {
      type: mongoose.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chat', chatSchema);
