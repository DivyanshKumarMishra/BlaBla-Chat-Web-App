const user = require('../models/user')
const User = require('../models/user')
const {body, validationResult} = require('express-validator')
const { sendErrorResponse } = require('../utils')
const fs = require('fs')

const getUserInfo = async (req, res, next) => { 
  try {
    const user = await User.findById(req.userId)
    if(!user) return res.status(404).json({error: 'User not found'})
    return res.status(200).json({name: user.name, email: user.email, profileSetup: user.profileSetup, color: user.color, id: user._id, image: user?.image?.replace(/\\/g, '/')})
  } catch (error) {
    res.status(500).json({message: `${error.message}`})
  }
}

const updateProfileInfo = [
  body('name')
    .isLength({min:5, max:100})
    .withMessage('name must be between 5 and 100 characters')
    .trim()
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("name must only contain letters, spaces, apostrophes, or hyphens"),

  body('email')
    .trim()
    .isEmail()
    .withMessage('enter a valid email')
    .normalizeEmail(),
  async (req, res, next) => { 
  const errors = await validationResult(req)
  if(!errors.isEmpty() && req.file?.path){
    fs.unlink(req.file.path, async (err) => {
      if (!err) await sendErrorResponse(req, res, errors)
    });
    return 
  }else{
    try {
      const {name, email, color} = req.body
      if(!name || !email || !color) throw { status: 400, message: 'Fill in all the details' };
      const user = await User.findById(req.userId)
      if(!user) throw { status: 404, message: 'User not found' };
      const previous_image = user?.image
      const new_image = req.file?.path
      if(previous_image && previous_image !== new_image && fs.existsSync(previous_image)){
        await new Promise((resolve, reject) => {
          fs.unlink(previous_image, (err) => {
            if (err) {
              reject(new Error(`Failed to delete old image: ${err.message}`));
            } else {
              resolve();
            }
          });
        });
      }
      
      user.name = name
      user.email = email
      user.image = new_image
      user.color = color
      user.profileSetup = true
      const updated_user = await user.save({new: true})
      return res.status(201).json({name: updated_user.name, email: updated_user.email, profileSetup: updated_user.profileSetup, color: updated_user.color, id: updated_user._id, image: updated_user?.image?.replace(/\\/g, '/')})
    } catch (err) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path); // Promisified version for file deletion
      }
      const status = err.status || 500;
      const message = err.message || 'Error updating profile';
      const details = err.details || {};
      return res.status(status).json({message, details});
    }
  }
}]

module.exports = {getUserInfo, updateProfileInfo}