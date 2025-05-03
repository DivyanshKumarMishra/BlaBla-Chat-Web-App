const express = require('express')
const {login, signup, logout} = require('../controllers/auth')
const authRouter = express.Router()

authRouter.use((req, res, next) => {
  console.log('auth middleware');
  next()
})

authRouter.post('/login', login)
authRouter.post('/signup', signup)
authRouter.post('/logout', logout)

module.exports = authRouter