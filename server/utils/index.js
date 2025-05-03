const path = require('path')
const basePath = path.dirname(require.main.filename)

const sendErrorResponse = async (req, res, errors) => {
  let errorsObj = {}
  errors.array().forEach(err => {
    errorsObj[err.path] = errorsObj[err.path] ? `${errorsObj[err.path]}, ${err.msg}` : err.msg
  })
  return res.status(400).send({error: 'Validation error', details: errorsObj})
}

module.exports = { sendErrorResponse, basePath }