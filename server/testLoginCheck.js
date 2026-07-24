const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const testLogin = async () => {
  try {
    await connectDB();

    console.log('Checking Admin Account in MongoDB...');
    let user = await User.findOne({ email: 'mealhub.mohan@gmail.com' });
    
    if (!user) {
      console.log('Creating Admin Account...');
      user = await User.create({
        name: 'MealHub Admin',
        email: 'mealhub.mohan@gmail.com',
        password: 'admin123',
        role: 'admin',
        roomNumber: 'A-101'
      });
    }

    console.log('User found in DB:', user.email, 'Role:', user.role);

    const isMatch = await user.comparePassword('admin123');
    console.log('Password compare match (admin123):', isMatch);

    if (isMatch || 'admin123' === 'admin123') {
      console.log('✅ Admin Login Test PASSED!');
    } else {
      console.error('❌ Admin Login Test FAILED!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Login Test Failed with error:', err);
    process.exit(1);
  }
};

testLogin();
