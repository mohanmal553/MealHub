const mongoose = require('mongoose');
const SystemConfig = require('./models/SystemConfig');

const ATLAS_URI = 'mongodb+srv://mohanmal553_db_user:CYvsq0Gt531SduuD@cluster0.iuednzg.mongodb.net/mealhub?retryWrites=true&w=majority';

async function testMaintenanceMode() {
  try {
    await mongoose.connect(ATLAS_URI, { dbName: 'mealhub' });
    console.log('Connected to MongoDB Atlas (mealhub)');

    console.log('1. Setting Maintenance Mode ON in DB...');
    await SystemConfig.findOneAndUpdate(
      { key: 'maintenance_mode' },
      { value: true, updatedBy: 'MealHub Admin' },
      { upsert: true, new: true }
    );

    let config = await SystemConfig.findOne({ key: 'maintenance_mode' });
    if (!config || config.value !== true) {
      throw new Error('Failed to set maintenance mode to true');
    }
    console.log('✅ Maintenance Mode ON confirmed in DB!');

    console.log('2. Resetting Maintenance Mode OFF in DB...');
    await SystemConfig.findOneAndUpdate(
      { key: 'maintenance_mode' },
      { value: false, updatedBy: 'MealHub Admin' },
      { upsert: true, new: true }
    );

    config = await SystemConfig.findOne({ key: 'maintenance_mode' });
    if (!config || config.value !== false) {
      throw new Error('Failed to set maintenance mode to false');
    }
    console.log('✅ Maintenance Mode OFF confirmed in DB!');

    console.log('\n🎉 MAINTENANCE MODE DATABASE TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failed:', err.message);
    process.exit(1);
  }
}

testMaintenanceMode();
