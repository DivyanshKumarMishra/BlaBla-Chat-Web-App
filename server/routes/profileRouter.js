const express = require('express')
const profileRouter = express.Router()
const {getUserInfo, updateProfileInfo} = require('../controllers/profile');
const multer = require('multer');

const multerOptions = {
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log(file)
      const uploadPath = path.join(basePath, `uploads/profiles/${req.userId}`);
      fs.mkdirSync(uploadPath, { recursive: true });  // Create the folder if it doesn't exist 
      cb(null, `uploads/profiles/${req.userId}`)
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname)
    }
  })
}

profileRouter.use(multer(multerOptions).single('image'))

profileRouter.get('/user-info', getUserInfo)
profileRouter.post('/update-profile', updateProfileInfo)

module.exports = profileRouter