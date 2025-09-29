const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { sendErrorResponse, generateToken } = require('../utils');
const { maxAge } = require('../utils/constants');

const signup = [
  body('name')
    .isLength({ min: 5, max: 100 })
    .trim()
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('enter a valid name'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('enter a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/\d/)
    .matches(/[@$!%*?&^#(){}[\]<>.,:;'"\\|/~_+=-]/)
    .withMessage('enter a valid password'),

  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  async (req, res, next) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, errors);
    } else {
      try {
        const { name, email, password, image } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
          return sendErrorResponse(res, 'User already exists', 400);
        }
        const new_user = new User({ name, email, password, image });
        const saved_user = await new_user.save();
        return res.status(201).json({
          name: saved_user.name,
          email: saved_user.email,
          id: saved_user._id,
          image: saved_user.image,
        });
      } catch (error) {
        return sendErrorResponse(res, {
          message: 'Error creating your account',
          details: `${error.message}`,
        });
      }
    }
  },
];

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return sendErrorResponse(res, 'Invalid email or password', 400);

    const token = generateToken({ email, id: user._id });
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge,
      secure: true,
      sameSite: 'none',
    });
    return res.status(200).json({
      name: user.name,
      email: user.email,
      id: user._id,
      image: user?.image?.replace(/\\/g, '/'),
    });
  } catch (error) {
    return sendErrorResponse(res, {
      message: 'Login failed',
      details: `${error.message}`,
    });
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      maxAge,
      secure: true,
      sameSite: 'none',
    });
    return res.status(200).json({ message: 'You have been signed out' });
  } catch (error) {
    return sendErrorResponse(res, {
      message: 'Error Signing out',
      details: `${error.message}`,
    });
  }
};

module.exports = { login, signup, logout };
