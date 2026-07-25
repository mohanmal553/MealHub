const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mealhub';
    
    // Ensure database name 'mealhub' is explicitly used
    const conn = await mongoose.connect(connStr, {
      dbName: 'mealhub',
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ Connected to MongoDB Database: "${conn.connection.name}" on host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
