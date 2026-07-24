const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mealhub';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Failed: ${error.message}`);
    console.warn(`Running in Hybrid/Fallback Mode. Endpoints will utilize memory/file fallback if DB unavailable.`);
    return false;
  }
};

module.exports = connectDB;
