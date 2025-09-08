const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const basePath = path.dirname(require.main.filename);
const { maxAge } = require('./constants');

const sendErrorResponse = (res, error, status) => {
  status = status || 500;

  if (typeof error === 'string') {
    return res.status(status).send({ message: error });
  } else if (typeof error === 'object') {
    return res.status(status).send({ message: error.message });
  } else {
    let errorsObj = {};
    error.array().forEach((err) => {
      errorsObj[err.path] = errorsObj[err.path]
        ? `${errorsObj[err.path]}, ${err.msg}`
        : err.msg;
    });
    return res
      .status(status)
      .send({ message: 'Validation error', details: errorsObj });
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

const encryptPass = async (pass) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(pass, salt);
};

const comparePass = async (pass, hash) => {
  return await bcrypt.compare(pass, hash);
};

module.exports = {
  sendErrorResponse,
  generateToken,
  encryptPass,
  comparePass,
  basePath,
};
