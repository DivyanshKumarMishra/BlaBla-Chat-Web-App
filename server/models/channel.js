const mongoose = require('mongoose')

const channelSchema = new mongoose.Schema({
  name: {type: String, required: true},
  color: {type: String, required: true},
  members:[{type: mongoose.Types.ObjectId, ref: 'User', required: true} ],
  admin:{type: mongoose.Types.ObjectId, ref: 'User', required: true},
  messages:[{type: mongoose.Types.ObjectId, ref: 'Message', required: true} ],
  createdAt: {type: Date, default: Date.now(), required: true},
  updatedAt: {type: Date, default: Date.now(), required: true}
})

channelSchema.pre('save', function(next){
  this.createdAt = Date.now()
  this.updatedAt = Date.now()
  next()
})

channelSchema.pre('findOneAndUpdate', function(next){
  this.set({updatedAt: Date.now()})
  next()
})

module.exports = mongoose.model('Channel', channelSchema)