const mongoose = require('mongoose');
require('dotenv').config();
const colors = require('colors');
const uri = process.env.MONGO_CONNECTION_STRING;

const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan);
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = connectToDB;
