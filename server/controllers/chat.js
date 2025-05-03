const Message = require('../models/message')

const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId 
    const user2 = req.params.userId 
    if(!user1 || !user2) throw {message: 'Could not load older messages', status: 400, details: {missingParams: 'Sender and receiver ids are required'}}

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ],
    })
    .sort({ timestamp: 1 })
    
    if(!messages) return {message: 'Could not load older messages', status: 404}
    return res.status(200).json({messages})
  } catch (error) {
    return res.status(error.status).json({message: error.message || `Error searching contacts`, details: error.details || {}});
  }
}

const uploadFile = async (req, res, next) => {
  try {
    let files = [];
    if (req.file) files.push(req.file.path);
    else if (req.files && req.files.length > 0) files = req.files.map(file => file.path);
    if (files.length === 0) throw {message: 'Error in uploading file',status: 400, details: { missingParams: 'File is required' }};
    return res.status(201).json({ filePaths: files });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || `Error uploading files`,
      details: error.details || {}
    });
  }
}

module.exports = {getMessages, uploadFile}