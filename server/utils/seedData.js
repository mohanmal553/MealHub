const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const seedAdminUser = async () => {
  try {
    await connectDB();

    console.log('Cleaning up old admin credentials...');
    await User.deleteMany({ email: { $in: ['mealhub@gmail.com', 'mealhub.mohan@gmail.com'] } });

    console.log('Creating Admin Account (mealhub.mohan@gmail.com)...');
    await User.create({
      name: 'MealHub Admin',
      email: 'mealhub.mohan@gmail.com',
      password: 'admin123',
      role: 'admin',
      roomNumber: 'A-101'
    });

    console.log('✅ Admin account seeded successfully (mealhub.mohan@gmail.com)!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err);
    process.exit(1);
  }
};

seedAdminUser();
