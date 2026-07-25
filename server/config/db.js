const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('⚡ Reusing existing MongoDB Atlas connection');
    return true;
  }

  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mealhub';
    
    console.log('📡 Connecting to MongoDB Atlas database...');

    const conn = await mongoose.connect(connStr, {
      dbName: 'mealhub',
      maxPoolSize: 10,               // Optimized connection pool size for Atlas M0
      minPoolSize: 1,                // Keep 1 warm connection active
      serverSelectionTimeoutMS: 15000, // 15s timeout to handle Render cold start DNS lookups
      socketTimeoutMS: 45000,          // 45s socket timeout
      connectTimeoutMS: 10000,         // 10s initial connection timeout
    });

    isConnected = true;
    console.log(`✅ MongoDB Atlas Connected: "${conn.connection.name}" on host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    isConnected = false;
    throw error;
  }
};

module.exports = connectDB;
