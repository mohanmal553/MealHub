const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const studentController = require('./controllers/studentController');
const authController = require('./controllers/authController');

const ATLAS_URI = 'mongodb+srv://mohanmal553_db_user:CYvsq0Gt531SduuD@cluster0.iuednzg.mongodb.net/mealhub?retryWrites=true&w=majority';

async function testMemberAddFlow() {
  try {
    await mongoose.connect(ATLAS_URI);
    console.log('Connected to MongoDB Atlas');

    const testEmail = `testuser_${Date.now()}@gmail.com`;
    const testPassword = 'testpassword123';

    console.log(`1. Testing Member Creation in MongoDB for ${testEmail}...`);
    const newStudent = await User.create({
      name: 'Test Student',
      email: testEmail,
      password: testPassword,
      role: 'student',
      roomNumber: 'C-301',
      phone: '9998887770'
    });

    console.log(`✅ Member created with ID: ${newStudent._id}`);

    console.log('2. Verifying Member exists in DB query...');
    const dbCheck = await User.findOne({ email: testEmail });
    if (!dbCheck) {
      throw new Error('Member not found in database query!');
    }
    console.log(`✅ Member found in DB: ${dbCheck.name} (${dbCheck.email})`);

    console.log('3. Testing Login for newly created member...');
    const isPasswordCorrect = await dbCheck.comparePassword(testPassword);
    if (!isPasswordCorrect) {
      throw new Error('Password check failed for newly created member!');
    }
    console.log('✅ LOGIN VERIFIED FOR NEWLY CREATED MEMBER!');

    console.log('4. Cleaning up test member...');
    await User.findByIdAndDelete(newStudent._id);
    console.log('✅ Cleanup finished!');

    console.log('\n🎉 ALL MEMBER CREATION & LOGIN TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failed:', err.message);
    process.exit(1);
  }
}

testMemberAddFlow();
