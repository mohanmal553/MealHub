const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const DailyMeal = require('./models/DailyMeal');

dotenv.config();

const testSave = async () => {
  try {
    await connectDB();

    const dummyStudentId = new mongoose.Types.ObjectId();
    const testDate = '2026-07-24';

    console.log('Testing DailyMeal DB Save with OFF status...');
    const saved = await DailyMeal.findOneAndUpdate(
      { date: testDate, student: dummyStudentId },
      { status: 'OFF', mealCount: 0 },
      { upsert: true, new: true }
    );

    console.log('DB Saved Document:', saved);

    const fetched = await DailyMeal.findOne({ date: testDate, student: dummyStudentId });
    console.log('DB Fetched Document Status:', fetched.status);

    await DailyMeal.deleteOne({ _id: saved._id });
    console.log('Cleaned test record. Test Passed!');
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
};

testSave();
