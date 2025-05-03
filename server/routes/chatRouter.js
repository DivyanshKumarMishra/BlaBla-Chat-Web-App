const express = require('express')
const chatRouter = express.Router()
const {searchContacts,getDmContacts, getAllContacts} = require('../controllers/contacts')
const {getMessages, uploadFile} = require('../controllers/chat')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const {basePath} = require('../utils')

chatRouter.use((req, res, next) => {
  // console.log(`chat middleware`);
  next()
})

const multerOptions = {
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log(req.query.timestamp)
      const timestamp = req.params.timestamp || Date.now()
      const uploadPath = path.join(basePath, `uploads/files/${req.userId}/${timestamp}`);
      fs.mkdirSync(uploadPath, { recursive: true });  // Create the folder if it doesn't exist 
      cb(null, `uploads/files/${req.userId}/${timestamp}`)
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname)
    }
  })
}

chatRouter.use(multer(multerOptions).array('files'))

chatRouter.post('/upload-file', uploadFile)
chatRouter.get('/search-contacts/:searchText', searchContacts)
chatRouter.get('/get-dms', getDmContacts)
chatRouter.get('/get-all-contacts', getAllContacts)
chatRouter.get('/get-messages/:userId', getMessages)

module.exports = chatRouter