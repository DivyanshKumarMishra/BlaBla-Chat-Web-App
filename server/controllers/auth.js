require('dotenv').config()
const {body, validationResult} = require('express-validator')
const User = require('../models/user')
const { sendErrorResponse } = require('../utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken') 

const maxAge = 3 * 24 * 60 * 60 * 1000;

const login = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('enter a valid email')
    .normalizeEmail(),

  body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/\d/)
  .withMessage('Password must contain at least one number')
  .matches(/[@$!%*?&^#(){}[\]<>.,:;'"\\|/~_+=-]/)
  .withMessage('Password must contain at least one special character'),

  async (req, res, next) => {
    const errors = await validationResult(req)
    if(!errors.isEmpty()){
      await sendErrorResponse(req, res, errors)
    }else{
      try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({error: 'Invalid email or password'})

        // send JWT with response
        const token = jwt.sign({email, id: user._id}, process.env.JWT_KEY, {expiresIn: maxAge})
        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge,
          secure: false,
          sameSite: 'Lax'})
        return res.status(201).json({name: user.name, email: user.email, profileSetup: user.profileSetup, id: user._id, color: user.color, image: user?.image?.replace(/\\/g, '/')})
      } catch (error) {
        return res.status(500).json({message: 'Login failed', details: `${error.message}`})
      }
    }
}]

const signup = [
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

  body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/\d/)
  .withMessage('Password must contain at least one number')
  .matches(/[@$!%*?&^#(){}[\]<>.,:;'"\\|/~_+=-]/)
  .withMessage('Password must contain at least one special character'),

  async (req, res, next) => {
    const errors = await validationResult(req)
    if(!errors.isEmpty()){
      await sendErrorResponse(req, res, errors)
      return
    }else{
      try {
        const {name, email, password} = req.body
        const hashed_password = await bcrypt.hash(password, 12)
        const new_user = new User({name, email, password: hashed_password})
        const saved_user = await new_user.save()
        return res.status(201).json({user: {name: saved_user.name, email: saved_user.email, id: saved_user._id}})
      } catch (error) {
        return res.status(500).json({message: 'Error creating your account', details: `${error.message}`})
      }
    }
}]

const logout = async (req, res, next) => {
    try {
      const token = req.cookies.jwt
      res.clearCookie('jwt', {
        httpOnly: true,
        maxAge,
        secure: false,
        sameSite: 'Lax'}
      )
      return res.status(200).json({message: 'You have been signed out'})
    } catch (error) {
      return res.status(500).json({message: 'Error Signing out', success: false, details: `${error.message}`})
    }
}

module.exports = { login, signup, logout }