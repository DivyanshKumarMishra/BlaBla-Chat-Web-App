const jwt = require('jsonwebtoken')
const jwt_key = process.env.JWT_KEY

const tokenVerification = async (req, res, next) => {
  const access_token = req.cookies.jwt || ''
  if(!access_token) return res.status(401).send('You are not authenticated')
  jwt.verify(access_token, jwt_key, (err, payload) => {
    if(err) return res.status(403).send('Token is not valid')
    req.userId = payload.id
    next()
  })
}

module.exports = tokenVerification