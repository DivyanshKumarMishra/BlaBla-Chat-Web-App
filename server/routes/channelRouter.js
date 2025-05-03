const express = require('express')
const {createChannel, getAllChannels, getChannelMessages} = require('../controllers/channel')

const channelRouter = express.Router()

channelRouter.post('/create-channel', createChannel)
channelRouter.get('/get-all-channels', getAllChannels)
channelRouter.get('/get-channel-messages/:channelId', getChannelMessages)

module.exports = channelRouter