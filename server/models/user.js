const mongoose = require('mongoose');
const { encryptPass, comparePass } = require('../utils');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: false, default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;

  this.password = await encryptPass(this.password);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await comparePass(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
