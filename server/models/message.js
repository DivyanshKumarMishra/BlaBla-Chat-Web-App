const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    state: {
      type: String,
      enum: ['pending', 'delivered'],
      default: 'pending',
      required: true,
    },
    messageType: { type: String, enum: ['text', 'file'], required: true },
    content: {
      type: String,
      required: function () {
        return this.messageType === 'text';
      },
    },
    fileUrl: {
      type: [String],
      required: function () {
        return this.messageType === 'file';
      },
    },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);
